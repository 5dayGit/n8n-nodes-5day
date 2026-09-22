import type {
	IAllExecuteFunctions,
	IDataObject,
	INodePropertyOptions,
	IHttpRequestMethods,
	INode,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError, NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://gateway.5day.io';
const PLATFORM = 'n8n';

function handleFiveDayApiError(node: INode, error: JsonObject): never {
	let errorMessage = 'Please check the provided parameters and try again.';

	// Extract error message from 5day API response structure
	try {
		// Structure 1: error.context.data.data.message (n8n NodeApiError from httpRequestWithAuthentication)
		if (error.context && typeof error.context === 'object') {
			const context = error.context as IDataObject;
			const contextData = context.data as IDataObject;

			if (contextData && typeof contextData === 'object') {
				// For our 5day API responses wrapped by httpRequestWithAuthentication
				if (contextData.data && typeof contextData.data === 'object') {
					const innerData = contextData.data as IDataObject;
					if (innerData.message) {
						errorMessage = innerData.message as string;
					}
				}
			}
		}

		// Structure 2: error.response.data (direct axios error)
		if (errorMessage === 'Please check the provided parameters and try again.' && error.response) {
			const response = error.response as IDataObject;

			if (response.data && typeof response.data === 'object') {
				const responseData = response.data as IDataObject;
				if (responseData.data && typeof responseData.data === 'object') {
					const innerData = responseData.data as IDataObject;
					if (innerData.message) {
						errorMessage = innerData.message as string;
					}
				}
			}
		}
	} catch {
		// Fallback if response parsing fails
		if (error.message) {
			errorMessage = error.message as string;
		}
	}

	// Create a new error with the extracted message to display it prominently
	const customError = new Error(errorMessage) as unknown as JsonObject;
	throw new NodeApiError(node, customError);
}

export async function fiveDayApiRequest(
	this: IAllExecuteFunctions,
	method: IHttpRequestMethods,
	entity: string,
	body: IDataObject = {},
	headers: IDataObject = {},
	isExecution = false,
): Promise<IDataObject> {
	const basePath = isExecution
		? `/api/integration-service/v1/execution/${PLATFORM}/event/${entity}`
		: `/api/integration-service/v1/data/${PLATFORM}/${entity}`;

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'fiveDayOAuth2Api', {
			method,
			url: `${BASE_URL}${basePath}`,
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
			body: method !== 'GET' ? body : undefined,
		});

		// Check if response indicates an error (statusCode >= 400)
		if (response && typeof response === 'object') {
			const responseObj = response as IDataObject;

			if (responseObj.statusCode && (responseObj.statusCode as number) >= 400) {
				// Manually create an error object with the response for proper extraction
				const error = new Error('API Error') as unknown as JsonObject;
				(error as IDataObject).response = {
					data: response,
				} as unknown as IDataObject;
				throw error;
			}
		}

		return response as IDataObject;
	} catch (error: unknown) {
		handleFiveDayApiError(this.getNode(), error as JsonObject);
	}
}

export async function fiveDayApiRequestAllItems(
	this: IAllExecuteFunctions,
	entity: string,
	headers: IDataObject = {},
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	let pageNumber = 0;
	const pageSize = returnAll ? 100 : limit;
	const allItems: IDataObject[] = [];
	let hasMore = true;

	while (hasMore) {
		let response: IDataObject;
		try {
			response = await this.helpers.httpRequestWithAuthentication.call(this, 'fiveDayOAuth2Api', {
				method: 'GET',
				url: `${BASE_URL}/api/integration-service/v1/data/${PLATFORM}/${entity}`,
				headers: {
					'Content-Type': 'application/json',
					...headers,
					pagesize: pageSize.toString(),
					pagenum: pageNumber.toString(),
				},
			}) as IDataObject;

			// Check if response indicates an error (statusCode >= 400)
			if (response && response.statusCode && (response.statusCode as number) >= 400) {
				// Manually create an error object with the response for proper extraction
				const error = new Error('API Error') as unknown as JsonObject;
				(error as IDataObject).response = {
					data: response,
				} as unknown as IDataObject;
				throw error;
			}
		} catch (error: unknown) {
			handleFiveDayApiError(this.getNode(), error as JsonObject);
		}

		const responseData = (response.response as IDataObject) ?? {};
		const items = Array.isArray(responseData.data) ? responseData : { data: [] };
		const data = Array.isArray(items.data) ? items.data as IDataObject[] : [];

		allItems.push(...data);

		if (!returnAll || data.length < pageSize) {
			hasMore = false;
		} else {
			pageNumber++;
		}
	}

	return allItems;
}

export async function fiveDayLoadOptions(
	this: IAllExecuteFunctions,
	entity: string,
	extraHeaders: IDataObject = {},
	nameField = 'name',
	valueField = 'id',
	valueTransform?: (item: IDataObject) => string,
): Promise<INodePropertyOptions[]> {
	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'fiveDayOAuth2Api', {
			method: 'GET',
			url: `${BASE_URL}/api/integration-service/v1/data/${PLATFORM}/${entity}`,
			headers: {
				'Content-Type': 'application/json',
				...extraHeaders,
			},
		});

		const items = Array.isArray(response?.response?.data)
			? response.response.data
			: [];

		return (items as IDataObject[]).map((item: IDataObject) => ({
			name: item[nameField] as string,
			value: valueTransform ? valueTransform(item) : (item[valueField] as string),
		}));
	} catch (error) {
		// Return an empty list so the dropdown just appears empty instead of breaking the
		// parameter UI; the underlying error (bad credentials, wrong endpoint, etc.) still
		// surfaces to the user when they run execute().
		this.logger.warn(`fiveDayLoadOptions: failed to load options for "${entity}": ${(error as Error).message}`);
		return [];
	}
}

export function validateUUID(node: INode, value: string, fieldName: string): void {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(value)) {
		throw new NodeOperationError(node, `${fieldName} must be a valid ID (e.g. 123e4567-e89b-12d3-a456-426614174000), got: "${value}"`);
	}
}

export function formatDate(dateValue: string): string {
	const date = new Date(dateValue);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseCustomAttributes(additionalFields: IDataObject): IDataObject | undefined {
	if (!additionalFields.customAttributesJson) {
		return undefined;
	}

	try {
		const customAttributes = typeof additionalFields.customAttributesJson === 'string'
			? JSON.parse(additionalFields.customAttributesJson as string) as IDataObject
			: additionalFields.customAttributesJson as IDataObject;
		if (Object.keys(customAttributes).length > 0) {
			return customAttributes;
		}
	} catch {
		// If JSON parsing fails, skip custom attributes
	}

	return undefined;
}

export function parseStatusField(node: INode, statusJson: string): IDataObject {
	let statusData: IDataObject;
	try {
		statusData = JSON.parse(statusJson) as IDataObject;
	} catch {
		throw new NodeOperationError(node, `Invalid status value: expected JSON but received "${statusJson}"`);
	}
	const result: IDataObject = {
		statusId: statusData.statusId as string,
	};
	if (statusData.stage !== undefined) {
		result.stage = statusData.stage;
	}
	if (statusData.projectWorkflowId !== undefined) {
		result.projectWorkflowId = statusData.projectWorkflowId as string;
	}
	return result;
}

export function validateDateRange(
	node: INode,
	startDate: string | undefined,
	endDate: string | undefined,
	endDateLabel = 'End date',
): void {
	if (startDate && endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (end < start) {
			throw new NodeOperationError(node, `${endDateLabel} must be after start date`);
		}
	}
}

export function validatePrefix(node: INode, prefix: string): void {
	const trimmedPrefix = prefix.trim().toUpperCase();
	const prefixLength = trimmedPrefix.length;

	if (prefixLength < 1 || prefixLength > 6) {
		throw new NodeOperationError(node, 'Prefix must be between 1 and 6 characters');
	}

	const alphanumericPattern = /^[a-zA-Z0-9]*$/;
	if (!alphanumericPattern.test(trimmedPrefix)) {
		throw new NodeOperationError(node, 'Prefix can only contain alphanumeric characters (letters and numbers)');
	}

	const restrictedPattern = /^[WSG]\d+$/;
	if (restrictedPattern.test(trimmedPrefix)) {
		throw new NodeOperationError(node, 'Prefix cannot start with W, S, or G followed by numbers');
	}
}

export function validateStoryPoint(node: INode, storyPoint: number): void {
	if (storyPoint < 0 || storyPoint > 99.99) {
		throw new NodeOperationError(node, 'Story Point must be between 0 and 99.99');
	}
}

export function applyWorkItemFields(node: INode, body: IDataObject, additionalFields: IDataObject): void {
	if (additionalFields.sectionId) {
		body.sectionId = additionalFields.sectionId as string;
	}

	if (additionalFields.description) {
		body.description = additionalFields.description as string;
	}

	if (additionalFields.budgetType) {
		body.budgetType = additionalFields.budgetType as string;
	}

	if (additionalFields.startDate) {
		body.startDate = formatDate(additionalFields.startDate as string);
	}

	if (additionalFields.dueDate) {
		validateDateRange(
			node,
			additionalFields.startDate as string | undefined,
			additionalFields.dueDate as string,
			'Due date',
		);
		body.dueDate = formatDate(additionalFields.dueDate as string);
	}

	if (additionalFields.priorityId) {
		body.priorityId = additionalFields.priorityId as string;
	}

	if (additionalFields.taskStatusId) {
		const statusData = parseStatusField(node, additionalFields.taskStatusId as string);
		body.taskStatusId = statusData.statusId;
		if (statusData.stage !== undefined) {
			body.stage = statusData.stage;
		}
		if (statusData.projectWorkflowId !== undefined) {
			body.projectWorkflowId = statusData.projectWorkflowId;
		}
	}

	if (additionalFields.progress) {
		body.progress = additionalFields.progress as number;
	}

	if (additionalFields.tags && Array.isArray(additionalFields.tags) && (additionalFields.tags as string[]).length > 0) {
		body.tags = additionalFields.tags as string[];
	}

	if (additionalFields.estimation !== undefined && additionalFields.estimation !== 0) {
		body.estimation = additionalFields.estimation as number;
	}

	if (additionalFields.storyPoint !== undefined) {
		body.storyPoint = additionalFields.storyPoint as number;
	}

	if (additionalFields.taskLinkItemId && Array.isArray(additionalFields.taskLinkItemId) && (additionalFields.taskLinkItemId as string[]).length > 0) {
		body.taskLinkItemId = additionalFields.taskLinkItemId as string[];
	}

	const customAttributes = parseCustomAttributes(additionalFields);
	if (customAttributes) {
		body.customAttributes = customAttributes;
	}
}

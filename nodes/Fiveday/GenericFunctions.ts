import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	INodePropertyOptions,
	IHttpRequestMethods,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://gateway.5day.io';
const PLATFORM = 'n8n';

async function getAccessToken(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const credentials = await context.getCredentials('fiveDayOAuth2Api');
	const oauthTokenData = credentials.oauthTokenData as IDataObject | undefined;
	const accessToken = oauthTokenData?.access_token as string | undefined;

	if (!accessToken) {
		throw new NodeApiError((context as IExecuteFunctions).getNode(), {}, {
			message: 'Authentication token missing',
			description: 'No access token found. Please reconnect your 5day.io credential.',
		});
	}

	// Warn if token is expired so the error is clear
	const expiresAt = oauthTokenData?.expires_at as number | undefined;
	if (expiresAt && Date.now() >= expiresAt) {
		throw new NodeApiError((context as IExecuteFunctions).getNode(), {}, {
			message: 'Access token expired',
			description: 'Your 5day.io OAuth2 token has expired. Please reconnect the credential to generate a new token.',
		});
	}

	return accessToken;
}

export async function fiveDayApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	entity: string,
	body: IDataObject = {},
	headers: IDataObject = {},
	isExecution = false,
): Promise<IDataObject> {
	const accessToken = await getAccessToken(this);

	const basePath = isExecution
		? `/api/integration-service/v1/execution/${PLATFORM}/event/${entity}`
		: `/api/integration-service/v1/data/${PLATFORM}/${entity}`;

	const response = await this.helpers.httpRequest({
		method,
		url: `${BASE_URL}${basePath}`,
		headers: {
			'Content-Type': 'application/json',
			'r-day5n8n-api-key': accessToken,
			...headers,
		},
		body: method !== 'GET' ? body : undefined,
	});

	return response as IDataObject;
}

export async function fiveDayApiRequestAllItems(
	this: IExecuteFunctions,
	entity: string,
	headers: IDataObject = {},
	returnAll: boolean,
	limit: number,
): Promise<IDataObject[]> {
	const accessToken = await getAccessToken(this);

	let pageNumber = 0;
	const pageSize = returnAll ? 100 : limit;
	const allItems: IDataObject[] = [];
	let hasMore = true;

	while (hasMore) {
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: `${BASE_URL}/api/integration-service/v1/data/${PLATFORM}/${entity}`,
			headers: {
				'Content-Type': 'application/json',
				'r-day5n8n-api-key': accessToken,
				...headers,
				pagesize: pageSize.toString(),
				pagenum: pageNumber.toString(),
			},
		});

		const items = Array.isArray(response?.response?.data)
			? (response as IDataObject).response as IDataObject
			: { data: [] };
		const data = Array.isArray((items as IDataObject).data) ? (items as IDataObject).data as IDataObject[] : [];

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
	this: ILoadOptionsFunctions,
	entity: string,
	extraHeaders: IDataObject = {},
	nameField = 'name',
	valueField = 'id',
	valueTransform?: (item: IDataObject) => string,
): Promise<INodePropertyOptions[]> {
	// Guard: return empty list if credentials are not yet fully configured
	const credentials = await this.getCredentials('fiveDayOAuth2Api').catch(() => null);
	if (!credentials?.oauthTokenData || Object.keys(credentials.oauthTokenData as IDataObject).length === 0) {
		return [];
	}

	const accessToken = (credentials.oauthTokenData as IDataObject).access_token as string | undefined;
	if (!accessToken) {
		return [];
	}

	try {
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: `${BASE_URL}/api/integration-service/v1/data/${PLATFORM}/${entity}`,
			headers: {
				'Content-Type': 'application/json',
				'r-day5n8n-api-key': accessToken,
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
		const errorObj = error as JsonObject;
		const errorMessage = typeof errorObj.message === 'string'
			? errorObj.message
			: 'Unknown error occurred';

		throw new NodeApiError(this.getNode(), errorObj, {
			message: `Failed to load ${entity}`,
			description: errorMessage,
		});
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

export function parseStatusField(statusJson: string): IDataObject {
	let statusData: IDataObject;
	try {
		statusData = JSON.parse(statusJson) as IDataObject;
	} catch {
		throw new Error(`Invalid status value: expected JSON but received "${statusJson}"`);
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
	startDate: string | undefined,
	endDate: string | undefined,
	endDateLabel = 'End date',
): void {
	if (startDate && endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (end <= start) {
			throw new Error(`${endDateLabel} must be after start date`);
		}
	}
}

export function applyWorkItemFields(body: IDataObject, additionalFields: IDataObject): void {
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
		const statusData = parseStatusField(additionalFields.taskStatusId as string);
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

	if (additionalFields.storyPoint !== undefined && additionalFields.storyPoint !== 0) {
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

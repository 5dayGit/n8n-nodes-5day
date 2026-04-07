import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeApiError } from 'n8n-workflow';

import { projectOperations, projectFields } from './ProjectDescription';
import { taskOperations, taskFields } from './TaskDescription';
import { subtaskOperations, subtaskFields } from './SubtaskDescription';
import { taskCommentOperations, taskCommentFields } from './TaskCommentDescription';
import { taskTagOperations, taskTagFields } from './TaskTagDescription';
import { userOperations, userFields } from './UserDescription';
import {
	fiveDayApiRequest,
	fiveDayApiRequestAllItems,
	fiveDayLoadOptions,
	formatDate,
	validateDateRange,
	parseStatusField,
	applyWorkItemFields,
	validateUUID,
} from './GenericFunctions';

export class Fiveday implements INodeType {
	description: INodeTypeDescription = {
		displayName: '5day.io',
		name: 'fiveday',
		icon: 'file:5day_logo.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Integrate with 5day.io project management tool',
		defaults: {
			name: '5day.io',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'fiveDayOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Subtask',
						value: 'subtask',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Task Comment',
						value: 'taskComment',
					},
					{
						name: 'Task Tag',
						value: 'taskTag',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'project',
			},
			projectOperations,
			taskOperations,
			subtaskOperations,
			taskCommentOperations,
			taskTagOperations,
			userOperations,
			...projectFields,
			...taskFields,
			...subtaskFields,
			...taskCommentFields,
			...taskTagFields,
			...userFields,
		],
	};

	methods = {
		loadOptions: {
			async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return fiveDayLoadOptions.call(this, 'workspace');
			},

			async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;
				if (!workspaceId) return [];
				return fiveDayLoadOptions.call(this, 'space', { 'workspace-id': workspaceId });
			},

			async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return fiveDayLoadOptions.call(this, 'project');
			},

			async getWorkitemTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'workitemtype', { 'project-id': projectId });
			},

			async getSections(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'section', { 'project-id': projectId });
			},

			async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'workitem', { 'project-id': projectId });
			},

			async getClients(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;
				if (!workspaceId) return [];
				return fiveDayLoadOptions.call(this, 'clients', { 'workspace-id': workspaceId });
			},

			async getPriorities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;
				if (!workspaceId) return [];
				return fiveDayLoadOptions.call(this, 'priorities', { 'workspace-id': workspaceId });
			},

			async getStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const workspaceId = this.getCurrentNodeParameter('workspaceId') as string;
				if (!workspaceId) return [];
				return fiveDayLoadOptions.call(
					this,
					'workitemstatus',
					{ 'workspace-id': workspaceId },
					'name',
					'id',
					(status: IDataObject) =>
						JSON.stringify({
							statusId: status.id,
							stage: status.stage,
							projectWorkflowId: status.workflowId,
						}),
				);
			},

			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'users', { 'project-id': projectId }, 'fullName');
			},

			async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'tags', { 'project-id': projectId });
			},

			async getTaskPriorities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(this, 'priorities', { 'project-id': projectId });
			},

			async getTaskStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const projectId = this.getCurrentNodeParameter('projectId') as string;
				if (!projectId) return [];
				return fiveDayLoadOptions.call(
					this,
					'workitemstatus',
					{ 'project-id': projectId },
					'name',
					'id',
					(status: IDataObject) =>
						JSON.stringify({
							statusId: status.id,
							stage: status.stage,
							projectWorkflowId: status.workflowId,
						}),
				);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'project') {
					if (operation === 'create') {
						const result = await executeProjectCreate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'delete') {
						const result = await executeProjectDelete.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'get') {
						const result = await executeProjectGet.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'getAll') {
						const results = await executeProjectGetAll.call(this, i);
						returnData.push(...results.map((r) => ({ json: r.json as IDataObject, pairedItem: { item: i } })));
					} else if (operation === 'update') {
						const result = await executeProjectUpdate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'task') {
					if (operation === 'create') {
						const result = await executeTaskCreate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'delete') {
						const result = await executeTaskDelete.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'get') {
						const result = await executeTaskGet.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'getAll') {
						const results = await executeTaskGetAll.call(this, i);
						returnData.push(...results.map((r) => ({ json: r.json as IDataObject, pairedItem: { item: i } })));
					} else if (operation === 'move') {
						const result = await executeTaskMove.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'search') {
						const results = await executeTaskSearch.call(this, i);
						returnData.push(...results.map((r) => ({ json: r.json as IDataObject, pairedItem: { item: i } })));
					} else if (operation === 'update') {
						const result = await executeTaskUpdate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'subtask') {
					if (operation === 'create') {
						const result = await executeSubtaskCreate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'getAll') {
						const results = await executeSubtaskGetAll.call(this, i);
						returnData.push(...results.map((r) => ({ json: r.json as IDataObject, pairedItem: { item: i } })));
					}
				} else if (resource === 'taskComment') {
					if (operation === 'create') {
						const result = await executeTaskCommentCreate.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'delete') {
						const result = await executeTaskCommentDelete.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'taskTag') {
					if (operation === 'addTag') {
						const result = await executeTaskTagAdd.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'removeTag') {
						const result = await executeTaskTagRemove.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'user') {
					if (operation === 'get') {
						const result = await executeUserGet.call(this, i);
						returnData.push({ json: result.json as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'getAll') {
						const results = await executeUserGetAll.call(this, i);
						returnData.push(...results.map((r) => ({ json: r.json as IDataObject, pairedItem: { item: i } })));
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}

// ------------------------------------------------------------------
//                    Project Operations
// ------------------------------------------------------------------

async function executeProjectCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const workspaceId = this.getNodeParameter('workspaceId', i) as string;
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		name,
		projectWorkflow: true,
	};

	const headers: IDataObject = {
		'workspace-id': workspaceId,
		action: 'create',
	};

	if (additionalFields.spaceId) {
		headers['space-id'] = additionalFields.spaceId as string;
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

	if (additionalFields.endDate) {
		validateDateRange(
			additionalFields.startDate as string | undefined,
			additionalFields.endDate as string,
			'End date',
		);
		body.endDate = formatDate(additionalFields.endDate as string);
	}

	if (additionalFields.progress) {
		body.progress = additionalFields.progress as number;
	}

	if (additionalFields.prefix) {
		body.prefix = additionalFields.prefix as string;
	}

	if (additionalFields.clientId) {
		body.clientId = additionalFields.clientId as string;
	}

	if (additionalFields.prioritiesId) {
		body.prioritiesId = additionalFields.prioritiesId as string;
	}

	if (additionalFields.statusId) {
		const statusData = parseStatusField(additionalFields.statusId as string);
		body.workItemStatusId = statusData.statusId;
		if (statusData.stage !== undefined) {
			body.stage = statusData.stage;
		}
		if (statusData.projectWorkflowId !== undefined) {
			body.projectWorkflowId = statusData.projectWorkflowId;
		}
	}

	const response = await fiveDayApiRequest.call(this, 'POST', 'project', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeProjectDelete(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	validateUUID(this.getNode(), projectId, 'Project ID');

	const headers: IDataObject = {
		action: 'delete',
	};

	const body: IDataObject = {
		id: projectId,
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'project', body, headers, true);
	return {
		json: {
			success: response.statusCode === 200
		},
	};
}

async function executeProjectGet(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	validateUUID(this.getNode(), projectId, 'Project ID');

	const headers: IDataObject = {
		'project-id': projectId,
	};

	const response = await fiveDayApiRequest.call(this, 'GET', 'projectbyid', {}, headers, false);
	const data = (response as IDataObject & { response?: { data?: IDataObject } }).response?.data;
	return { json: (data as IDataObject) ?? (response as IDataObject) };
}

async function executeProjectUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	validateUUID(this.getNode(), projectId, 'Project ID');
	const workspaceId = this.getNodeParameter('workspaceId', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {};

	const headers: IDataObject = {
		'workspace-id': workspaceId,
		action: 'update',
	};

	body.id = projectId;

	if (additionalFields.name) {
		body.name = additionalFields.name as string;
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

	if (additionalFields.endDate) {
		validateDateRange(
			additionalFields.startDate as string | undefined,
			additionalFields.endDate as string,
			'End date',
		);
		body.endDate = formatDate(additionalFields.endDate as string);
	}

	if (additionalFields.progress) {
		body.progress = additionalFields.progress as number;
	}

	if (additionalFields.prefix) {
		body.prefix = additionalFields.prefix as string;
	}

	if (additionalFields.clientId) {
		body.clientId = additionalFields.clientId as string;
	}

	if (additionalFields.prioritiesId) {
		body.prioritiesId = additionalFields.prioritiesId as string;
	}

	if (additionalFields.statusId) {
		const statusData = parseStatusField(additionalFields.statusId as string);
		body.workItemStatusId = statusData.statusId;
		if (statusData.stage !== undefined) {
			body.stage = statusData.stage;
		}
		if (statusData.projectWorkflowId !== undefined) {
			body.projectWorkflowId = statusData.projectWorkflowId;
		}
	}

	const response = await fiveDayApiRequest.call(this, 'POST', 'project', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeProjectGetAll(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const workspaceId = this.getNodeParameter('workspaceId', i) as string;
	const filterBySpace = this.getNodeParameter('filterBySpace', i) as boolean;
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const headers: IDataObject = {
		'workspace-id': workspaceId,
	};

	if (filterBySpace) {
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		if (spaceId) headers['space-id'] = spaceId;
	}

	const results = await fiveDayApiRequestAllItems.call(this, 'projectdetail', headers, returnAll, limit);
	return results.map((item) => ({ json: item }));
}

// ------------------------------------------------------------------
//                    Task Operations
// ------------------------------------------------------------------

async function executeTaskCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const taskTypeId = this.getNodeParameter('workitemTypeId', i) as string;
	const taskName = this.getNodeParameter('taskName', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		name: taskName,
		projectId,
		taskTypeId,
	};

	const headers: IDataObject = {
		action: 'create',
	};

	applyWorkItemFields(body, additionalFields);

	if (additionalFields.assignee && Array.isArray(additionalFields.assignee) && (additionalFields.assignee as string[]).length > 0) {
		body.assignee = additionalFields.assignee as string[];
	}

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeTaskDelete(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');

	const headers: IDataObject = {
		action: 'delete',
	};

	const body: IDataObject = {
		id: taskId,
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return {
		json: {
			success: response.statusCode === 200
		},
	};
}

async function executeTaskGet(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');

	const headers: IDataObject = {
		'workitem-id': taskId,
	};

	const response = await fiveDayApiRequest.call(this, 'GET', 'workitembyid', {}, headers, false);
	const data = (response as IDataObject & { response?: { data?: IDataObject } }).response?.data;
	return { json: (data as IDataObject) ?? (response as IDataObject) };
}

async function executeTaskUpdate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		id: taskId,
		projectId,
	};

	const headers: IDataObject = {
		'workitem-id': taskId,
		'project-id': projectId,
		action: 'update',
	};

	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}

	if (additionalFields.workitemTypeId) {
		body.taskTypeId = additionalFields.workitemTypeId as string;
	}

	applyWorkItemFields(body, additionalFields);

	if (additionalFields.assignee && Array.isArray(additionalFields.assignee) && (additionalFields.assignee as string[]).length > 0) {
		body.assignee = additionalFields.assignee as string[];
	}

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeTaskGetAll(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const filterBySection = this.getNodeParameter('filterBySection', i) as boolean;
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const headers: IDataObject = {
		'project-id': projectId,
	};

	if (filterBySection) {
		const sectionId = this.getNodeParameter('sectionId', i) as string;
		if (sectionId) headers['section-id'] = sectionId;
	}

	const results = await fiveDayApiRequestAllItems.call(this, 'workitem', headers, returnAll, limit);
	return results.map((item) => ({ json: item }));
}

async function executeTaskMove(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');
	const projectId = this.getNodeParameter('projectId', i) as string;
	const sectionId = this.getNodeParameter('sectionId', i) as string;

	const body: IDataObject = {
		id: taskId,
		projectId,
		sectionId,
	};

	const headers: IDataObject = {
		action: 'move',
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return {
		json: {
			success: response.statusCode === 200
		},
	};
}

async function executeTaskSearch(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const searchQuery = this.getNodeParameter('searchQuery', i) as string;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const headers: IDataObject = {
		searchText: searchQuery,
	};

	const results = await fiveDayApiRequestAllItems.call(this, 'workitemsearch', headers, returnAll, limit);
	return results.map((item) => ({ json: item }));
}

// ------------------------------------------------------------------
//                    Subtask Operations
// ------------------------------------------------------------------

async function executeSubtaskCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const taskTypeId = this.getNodeParameter('workitemTypeId', i) as string;
	const parentTaskId = this.getNodeParameter('parentTaskId', i) as string;
	validateUUID(this.getNode(), parentTaskId, 'Parent Task ID');
	const taskName = this.getNodeParameter('taskName', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		name: taskName,
		projectId,
		taskTypeId,
		parentTaskId,
	};

	const headers: IDataObject = {
		action: 'create',
	};

	applyWorkItemFields(body, additionalFields);

	if (additionalFields.assignee) {
		body.assignee = [additionalFields.assignee as string];
	}

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeSubtaskGetAll(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const parentTaskId = this.getNodeParameter('parentTaskId', i) as string;
	validateUUID(this.getNode(), parentTaskId, 'Parent Task ID');
	const filterBySection = this.getNodeParameter('filterBySection', i) as boolean;
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const headers: IDataObject = {
		'project-id': projectId,
		'parent-id': parentTaskId,
	};

	if (filterBySection) {
		const sectionId = this.getNodeParameter('sectionId', i) as string;
		if (sectionId) headers['section-id'] = sectionId;
	}

	const results = await fiveDayApiRequestAllItems.call(this, 'workitem', headers, returnAll, limit);
	return results.map((item) => ({ json: item }));
}

// ------------------------------------------------------------------
//                    Task Comment Operations
// ------------------------------------------------------------------

async function executeTaskCommentCreate(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const projectId = this.getNodeParameter('projectId', i) as string;
	const workitemId = this.getNodeParameter('workitemId', i) as string;
	validateUUID(this.getNode(), workitemId, 'Task ID');
	const messageBody = this.getNodeParameter('messageBody', i) as string;

	const body: IDataObject = {
		messageBody,
		projectId,
		workitemId,
	};

	const headers: IDataObject = {
		action: 'create',
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitemcomment', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeTaskCommentDelete(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const commentId = this.getNodeParameter('commentId', i) as string;
	validateUUID(this.getNode(), commentId, 'Comment ID');

	const body: IDataObject = {
		commentId,
	};

	const headers: IDataObject = {
		action: 'delete',
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitemcomment', body, headers, true);
	return {
		json: {
			success: response.statusCode === 200
		},
	};
}

// ------------------------------------------------------------------
//                    User Operations
// ------------------------------------------------------------------

async function executeUserGet(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const userId = this.getNodeParameter('userId', i) as string;
	validateUUID(this.getNode(), userId, 'User ID');

	const headers: IDataObject = {
		'user-id': userId,
	};

	const response = await fiveDayApiRequest.call(this, 'GET', 'userbyid', {}, headers, false);
	const data = (response as IDataObject & { response?: { data?: IDataObject } }).response?.data;
	return { json: (data as IDataObject) ?? (response as IDataObject) };
}


async function executeUserGetAll(this: IExecuteFunctions, i: number): Promise<IDataObject[]> {
	const filterByWorkspace = this.getNodeParameter('filterByWorkspace', i) as boolean;
	const filterByProject = this.getNodeParameter('filterByProject', i) as boolean;
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const limit = this.getNodeParameter('limit', i, 50) as number;

	const headers: IDataObject = {};

	if (filterByWorkspace) {
		const workspaceId = this.getNodeParameter('workspaceId', i) as string;
		if (workspaceId) headers['workspace-id'] = workspaceId;
	}

	if (filterByProject) {
		const projectId = this.getNodeParameter('projectId', i) as string;
		if (projectId) headers['project-id'] = projectId;
	}

	const results = await fiveDayApiRequestAllItems.call(this, 'users', headers, returnAll, limit);
	return results.map((item) => ({ json: item }));
}

// ------------------------------------------------------------------
//                    Task Tag Operations
// ------------------------------------------------------------------

async function executeTaskTagAdd(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');
	const projectId = this.getNodeParameter('projectId', i) as string;
	const tags = this.getNodeParameter('tags', i) as string[];

	const body: IDataObject = {
		id: taskId,
		projectId,
		tags,
	};

	const headers: IDataObject = {
		action: 'update',
		subaction: "add",
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return { json: response.data as IDataObject };
}

async function executeTaskTagRemove(this: IExecuteFunctions, i: number): Promise<IDataObject> {
	const taskId = this.getNodeParameter('taskId', i) as string;
	validateUUID(this.getNode(), taskId, 'Task ID');
	const projectId = this.getNodeParameter('projectId', i) as string;
	const tags = this.getNodeParameter('tags', i) as string[];

	const body: IDataObject = {
		id: taskId,
		projectId,
		tags,
	};

	const headers: IDataObject = {
		action: 'update',
		subaction: "remove",
	};

	const response = await fiveDayApiRequest.call(this, 'POST', 'workitem', body, headers, true);
	return { json: response.data as IDataObject };
}

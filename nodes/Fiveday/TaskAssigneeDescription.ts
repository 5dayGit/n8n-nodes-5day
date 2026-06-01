import type { INodeProperties } from 'n8n-workflow';

export const taskAssigneeOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['taskAssignee'],
		},
	},
	options: [
		{
			name: 'Add Assignee',
			value: 'addAssignee',
			description: 'Add an assignee to a task',
			action: 'Add an assignee to a task',
		},
		{
			name: 'Remove Assignee',
			value: 'removeAssignee',
			description: 'Remove an assignee from a task',
			action: 'Remove an assignee from a task',
		},
	],
	default: 'addAssignee',
};

export const taskAssigneeFields: INodeProperties[] = [
	// ----------------------------------
	//      Task Assignee: Add Assignee
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. PRO-1',
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['addAssignee'],
			},
		},
		description: 'The ID of the task to add an assignee to',
	},
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
			loadOptionsDependsOn: ['credentials.fiveDayOAuth2Api'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['addAssignee'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Assignee Names or IDs',
		name: 'assignee',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getAssignees',
			loadOptionsDependsOn: ['projectId', 'taskId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['addAssignee'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	// ----------------------------------
	//     Task Assignee: Remove Assignee
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. PRO-1',
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['removeAssignee'],
			},
		},
		description: 'The ID of the task to remove an assignee from',
	},
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
			loadOptionsDependsOn: ['credentials.fiveDayOAuth2Api'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['removeAssignee'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Assignee Names or IDs',
		name: 'assignee',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getAssignees',
			loadOptionsDependsOn: ['projectId', 'taskId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskAssignee'],
				operation: ['removeAssignee'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

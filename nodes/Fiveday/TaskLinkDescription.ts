import type { INodeProperties } from 'n8n-workflow';

export const taskLinkOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['taskLink'],
		},
	},
	options: [
		{
			name: 'Add Link',
			value: 'addLink',
			description: 'Add a link to a task',
			action: 'Add a link to a task',
		},
		{
			name: 'Remove Link',
			value: 'removeLink',
			description: 'Remove a link from a task',
			action: 'Remove a link from a task',
		},
	],
	default: 'addLink',
};

export const taskLinkFields: INodeProperties[] = [
	// ----------------------------------
	//         Task Link: Add Link
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
				resource: ['taskLink'],
				operation: ['addLink'],
			},
		},
		description: 'The ID of the task to add a link to',
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
				resource: ['taskLink'],
				operation: ['addLink'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Link Task Names or IDs',
		name: 'linkedTaskIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getTasksForLink',
			loadOptionsDependsOn: ['projectId', 'taskId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskLink'],
				operation: ['addLink'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	// ----------------------------------
	//        Task Link: Remove Link
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
				resource: ['taskLink'],
				operation: ['removeLink'],
			},
		},
		description: 'The ID of the task to remove a link from',
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
				resource: ['taskLink'],
				operation: ['removeLink'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Link Task Names or IDs',
		name: 'linkedTaskIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getTasksForLink',
			loadOptionsDependsOn: ['projectId', 'taskId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskLink'],
				operation: ['removeLink'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

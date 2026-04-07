import type { INodeProperties } from 'n8n-workflow';

export const taskTagOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['taskTag'],
		},
	},
	options: [
		{
			name: 'Add Tag',
			value: 'addTag',
			description: 'Add a task tag',
			action: 'Add a task tag',
		},
		{
			name: 'Remove Tag',
			value: 'removeTag',
			description: 'Remove a task tag',
			action: 'Remove a task tag',
		},
	],
	default: 'addTag',
};

export const taskTagFields: INodeProperties[] = [
	// ----------------------------------
	//         Task Tag: Add Tag
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskTag'],
				operation: ['addTag'],
			},
		},
		description: 'The ID of the task to add a tag to',
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
				resource: ['taskTag'],
				operation: ['addTag'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Tag Names or IDs',
		name: 'tags',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getTags',
			loadOptionsDependsOn: ['projectId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskTag'],
				operation: ['addTag'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	// ----------------------------------
	//         Task Tag: Remove Tag
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskTag'],
				operation: ['removeTag'],
			},
		},
		description: 'The ID of the task to remove a tag from',
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
				resource: ['taskTag'],
				operation: ['removeTag'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Tag Names or IDs',
		name: 'tags',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getTags',
			loadOptionsDependsOn: ['projectId'],
		},
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['taskTag'],
				operation: ['removeTag'],
			},
		},
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

import type { INodeProperties } from 'n8n-workflow';

export const taskCommentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['taskComment'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Add a comment to a task',
			action: 'Add a comment to a task',
		},
	],
	default: 'create',
};

export const taskCommentFields: INodeProperties[] = [
	// ----------------------------------
	//         Task Comment: Create
	// ----------------------------------
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
				resource: ['taskComment'],
				operation: ['create'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Task ID',
		name: 'workitemId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskComment'],
				operation: ['create'],
			},
		},
		description: 'The ID of the task to add the comment to',
	},
	{
		displayName: 'Comment',
		name: 'messageBody',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskComment'],
				operation: ['create'],
			},
		},
		description: 'Comment message body',
	},
];

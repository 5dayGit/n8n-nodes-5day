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
			description: 'Add a task comment',
			action: 'Add a task comment',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Remove a task comment',
			action: 'Remove a task comment',
		},
	],
	default: 'create',
};

export const taskCommentFields: INodeProperties[] = [
	// ----------------------------------
	//         Task Comment: Delete
	// ----------------------------------
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['taskComment'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the comment to delete',
	},
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
		placeholder: 'e.g. PRO-1',
		displayOptions: {
			show: {
				resource: ['taskComment'],
				operation: ['create'],
			},
		},
		description: 'The human-readable ID of the task as shown in the 5day application (e.g. PRO-1)',
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

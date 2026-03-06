import type { INodeProperties } from 'n8n-workflow';

const budgetTypeOptions: INodeProperties['options'] = [
	{
		name: 'Billable',
		value: 'billable',
	},
	{
		name: 'Non-Billable',
		value: 'non-billable',
	},
];

export const projectOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['project'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new project',
			action: 'Create a project',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			description: 'Get many projects',
			action: 'Get many projects',
		},
	],
	default: 'create',
};

export const projectFields: INodeProperties[] = [
	// ----------------------------------
	//         Project: Create
	// ----------------------------------
	{
		displayName: 'Workspace Name or ID',
		name: 'workspaceId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkspaces',
			loadOptionsDependsOn: ['credentials.fiveDayOAuth2Api'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
			},
		},
		description: 'The name of the project to create',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Budget Type',
				name: 'budgetType',
				type: 'options',
				options: budgetTypeOptions,
				default: 'non-billable',
				description: 'The budget type for the project',
			},
			{
				displayName: 'Client Name or ID',
				name: 'clientId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getClients',
					loadOptionsDependsOn: ['workspaceId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description for the project',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'The end date of the project (must be after start date)',
			},
			{
				displayName: 'Prefix',
				name: 'prefix',
				type: 'string',
				default: '',
				typeOptions: {
					minLength: 1,
					maxLength: 6,
				},
				description: 'The prefix of project',
			},
			{
				displayName: 'Priority Name or ID',
				name: 'prioritiesId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPriorities',
					loadOptionsDependsOn: ['workspaceId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Progress',
				name: 'progress',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 0,
				description: 'The progress percentage of the project (1-100)',
			},
			{
				displayName: 'Space Name or ID',
				name: 'spaceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSpaces',
					loadOptionsDependsOn: ['workspaceId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'The start date of the project',
			},
			{
				displayName: 'Status Name or ID',
				name: 'statusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStatuses',
					loadOptionsDependsOn: ['workspaceId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	},
	// ----------------------------------
	//         Project: Get All
	// ----------------------------------
	{
		displayName: 'Workspace Name or ID',
		name: 'workspaceId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkspaces',
			loadOptionsDependsOn: ['credentials.fiveDayOAuth2Api'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getAll'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Filter by Space',
		name: 'filterBySpace',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to filter projects by a specific space',
	},
	{
		displayName: 'Space Name or ID',
		name: 'spaceId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSpaces',
			loadOptionsDependsOn: ['workspaceId'],
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getAll'],
				filterBySpace: [true],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];

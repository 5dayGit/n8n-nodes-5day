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

export const subtaskOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['subtask'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new subtask',
			action: 'Create a subtask',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			description: 'Get many subtasks',
			action: 'Get many subtasks',
		},
	],
	default: 'create',
};

export const subtaskFields: INodeProperties[] = [
	// ----------------------------------
	//         Subtask: Create
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
				resource: ['subtask'],
				operation: ['create'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Work Item Type Name or ID',
		name: 'workitemTypeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkitemTypes',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['create'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Parent Task ID',
		name: 'parentTaskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['create'],
			},
		},
		description: 'The ID of the parent task under which the subtask will be created',
	},
	{
		displayName: 'Subtask Name',
		name: 'taskName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['create'],
			},
		},
		description: 'The name of the subtask to create',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee Name or ID',
				name: 'assignee',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
					loadOptionsDependsOn: ['projectId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Budget Type',
				name: 'budgetType',
				type: 'options',
				options: budgetTypeOptions,
				default: 'non-billable',
				description: 'The budget type for the subtask',
			},
			{
				displayName: 'Custom Fields JSON',
				name: 'customAttributesJson',
				type: 'json',
				default: '{}',
				description: 'Custom attributes as JSON object. Format: {"fieldId1": "value1", "fieldId2": ["option1", "option2"]}. Use field IDs as keys and appropriate values based on field type.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description for the subtask',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'The due date of the subtask (should be after start date)',
			},
			{
				displayName: 'Estimation',
				name: 'estimation',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Estimation value for the subtask (>= 0)',
			},
			{
				displayName: 'Linked Task Names or IDs',
				name: 'taskLinkItemId',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getTasks',
					loadOptionsDependsOn: ['projectId'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Priority Name or ID',
				name: 'priorityId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTaskPriorities',
					loadOptionsDependsOn: ['projectId'],
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
				description: 'The progress percentage of the subtask (1-100)',
			},
			{
				displayName: 'Section Name or ID',
				name: 'sectionId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSections',
					loadOptionsDependsOn: ['projectId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'The start date of the subtask',
			},
			{
				displayName: 'Status Name or ID',
				name: 'taskStatusId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTaskStatuses',
					loadOptionsDependsOn: ['projectId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Story Point',
				name: 'storyPoint',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Story point value for the subtask (>= 0)',
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
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	},
	// ----------------------------------
	//         Subtask: Get All
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
				resource: ['subtask'],
				operation: ['getAll'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Parent Task ID',
		name: 'parentTaskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['getAll'],
			},
		},
		description: 'The ID of the parent task whose subtasks to retrieve',
	},
	{
		displayName: 'Filter by Section',
		name: 'filterBySection',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to filter subtasks by a specific section',
	},
	{
		displayName: 'Section Name or ID',
		name: 'sectionId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSections',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['subtask'],
				operation: ['getAll'],
				filterBySection: [true],
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
				resource: ['subtask'],
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
				resource: ['subtask'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];

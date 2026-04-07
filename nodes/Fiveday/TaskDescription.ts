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

export const taskOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['task'],
		},
	},
	options: [
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new task',
			action: 'Create a task',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a task',
			action: 'Delete a task',
		},
		{
			name: 'Get',
			value: 'get',
			description: 'Get a task',
			action: 'Get a task',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			description: 'Get many tasks',
			action: 'Get many tasks',
		},
		{
			name: 'Move',
			value: 'move',
			description: 'Move a task to a different project or section',
			action: 'Move a task',
		},
		{
			name: 'Search',
			value: 'search',
			description: 'Search for tasks',
			action: 'Search for tasks',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a task',
			action: 'Update a task',
		},
	],
	default: 'create',
};

export const taskFields: INodeProperties[] = [
	// ----------------------------------
	//         Task: Create
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
				resource: ['task'],
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
				resource: ['task'],
				operation: ['create'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Task Name',
		name: 'taskName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		description: 'The name of the task to create',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee Names or IDs',
				name: 'assignee',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
					loadOptionsDependsOn: ['projectId'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Budget Type',
				name: 'budgetType',
				type: 'options',
				options: budgetTypeOptions,
				default: 'non-billable',
				description: 'The budget type for the task',
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
				description: 'Description for the task',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'The due date of the task (should be after start date)',
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
				description: 'Estimation value for the task (>= 0)',
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
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'The progress percentage of the task (1-100)',
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
				description: 'The start date of the task',
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
				description: 'Story point value for the task (>= 0)',
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
	//         Task: Get All
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
				resource: ['task'],
				operation: ['getAll'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Filter by Section',
		name: 'filterBySection',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to filter tasks by a specific section',
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
				resource: ['task'],
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
				resource: ['task'],
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
				resource: ['task'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// ----------------------------------
	//         Task: Search
	// ----------------------------------
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['search'],
			},
		},
		description: 'The search query to find tasks',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['search'],
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
				resource: ['task'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	// ----------------------------------
	//         Task: Delete
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['delete'],
			},
		},
		description: 'The ID of the task to delete',
	},
	// ----------------------------------
	//         Task: Get
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get'],
			},
		},
		description: 'The ID of the task to retrieve',
	},
	// ----------------------------------
	//         Task: Move
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['move'],
			},
		},
		description: 'The ID of the task to move',
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
				resource: ['task'],
				operation: ['move'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['move'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	// ----------------------------------
	//         Task: Update
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
				resource: ['task'],
				operation: ['update'],
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		description: 'The ID of the task to update',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignee Names or IDs',
				name: 'assignee',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
					loadOptionsDependsOn: ['projectId'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Budget Type',
				name: 'budgetType',
				type: 'options',
				options: budgetTypeOptions,
				default: 'non-billable',
				description: 'The budget type for the task',
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
				description: 'Description for the task',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'The due date of the task (should be after start date)',
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
				description: 'Estimation value for the task (>= 0)',
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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The new name of the task',
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
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'The progress percentage of the task (1-100)',
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
				description: 'The start date of the task',
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
				description: 'Story point value for the task (>= 0)',
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
			{
				displayName: 'Work Item Type Name or ID',
				name: 'workitemTypeId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getWorkitemTypes',
					loadOptionsDependsOn: ['projectId'],
				},
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	},
];

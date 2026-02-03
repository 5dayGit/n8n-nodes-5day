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

export class Fiveday implements INodeType {
    description: INodeTypeDescription = {
        displayName: '5day.io',
        name: 'fiveday',
        icon: 'file:5day_logo.svg',
        group: ['transform'],
        version: 1,
        usableAsTool: true,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Integrate with 5day project management tool',
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
            // ----------------------------------------
            //              Resource
            // ----------------------------------------
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Project',
                        value: 'projectActions',
                    },
                    {
                        name: 'Task',
                        value: 'taskActions',
                    },
                ],
                default: 'projectActions',
            },
            // ----------------------------------------
            //         Project Actions - Operations
            // ----------------------------------------
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['projectActions'],
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
                        name: 'Delete',
                        value: 'delete',
                        description: 'Delete a project',
                        action: 'Delete a project',
                    },
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a project',
                        action: 'Get a project',
                    },
                    {
                        name: 'Get Many',
                        value: 'getAll',
                        description: 'Get all projects',
                        action: 'Get all projects',
                    },
                    {
                        name: 'Update',
                        value: 'update',
                        description: 'Update a project',
                        action: 'Update a project',
                    },
                ],
                default: 'create',
            },
            // ----------------------------------------
            //         Task Actions - Operations
            // ----------------------------------------
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
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
                        description: 'Get all tasks',
                        action: 'Get all tasks',
                    },
                    {
                        name: 'Move',
                        value: 'move',
                        description: 'Move a task to another project',
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
            },
            // ----------------------------------------
            //     Project Actions - Create Fields
            // ----------------------------------------
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
                        resource: ['projectActions'],
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
                        resource: ['projectActions'],
                        operation: ['create'],
                    },
                },
                description: 'The name of the project to create',
            },
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                displayOptions: {
                    show: {
                        resource: ['projectActions'],
                        operation: ['create'],
                    },
                },
                description: 'Description for the project',
            },
            // ----------------------------------------
            //     Project Actions - Delete Fields
            // ----------------------------------------
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
                        resource: ['projectActions'],
                        operation: ['delete'],
                    },
                },
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            // ----------------------------------------
            //     Project Actions - Get Fields
            // ----------------------------------------
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
                        resource: ['projectActions'],
                        operation: ['get'],
                    },
                },
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            // ----------------------------------------
            //     Project Actions - Get All Fields
            // ----------------------------------------
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
                        resource: ['projectActions'],
                        operation: ['getAll'],
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
                        resource: ['projectActions'],
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
                        resource: ['projectActions'],
                        operation: ['getAll'],
                        returnAll: [false],
                    },
                },
                description: 'Max number of results to return',
            },
            // ----------------------------------------
            //     Project Actions - Update Fields
            // ----------------------------------------
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
                        resource: ['projectActions'],
                        operation: ['update'],
                    },
                },
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            {
                displayName: 'Update Fields',
                name: 'updateFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['projectActions'],
                        operation: ['update'],
                    },
                },
                options: [
                    {
                        displayName: 'Name',
                        name: 'name',
                        type: 'string',
                        default: '',
                        description: 'The new name of the project',
                    },
                    {
                        displayName: 'Description',
                        name: 'description',
                        type: 'string',
                        typeOptions: {
                            rows: 4,
                        },
                        default: '',
                        description: 'The new description of the project',
                    },
                ],
            },
            // ----------------------------------------
            //       Task Actions - Create Fields
            // ----------------------------------------
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
                        resource: ['taskActions'],
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
                        resource: ['taskActions'],
                        operation: ['create'],
                    },
                },
                description: 'The name of the task to create',
            },
            // ----------------------------------------
            //       Task Actions - Delete Fields
            // ----------------------------------------
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['delete'],
                    },
                },
                description: 'The ID of the task to delete',
            },
            // ----------------------------------------
            //       Task Actions - Get Fields
            // ----------------------------------------
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['get'],
                    },
                },
                description: 'The ID of the task to retrieve',
            },
            // ----------------------------------------
            //       Task Actions - Get All Fields
            // ----------------------------------------
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
                        resource: ['taskActions'],
                        operation: ['getAll'],
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
                        resource: ['taskActions'],
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
                        resource: ['taskActions'],
                        operation: ['getAll'],
                        returnAll: [false],
                    },
                },
                description: 'Max number of results to return',
            },
            // ----------------------------------------
            //       Task Actions - Move Fields
            // ----------------------------------------
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['move'],
                    },
                },
                description: 'The ID of the task to move',
            },
            {
                displayName: 'Target Project Name or ID',
                name: 'targetProjectId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getProjects',
                    loadOptionsDependsOn: ['credentials.fiveDayOAuth2Api'],
                },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['move'],
                    },
                },
                description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            // ----------------------------------------
            //       Task Actions - Search Fields
            // ----------------------------------------
            {
                displayName: 'Search Query',
                name: 'searchQuery',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['search'],
                    },
                },
                description: 'The search query to find tasks',
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
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['search'],
                    },
                },
                description: 'Optionally filter by project. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            },
            // ----------------------------------------
            //       Task Actions - Update Fields
            // ----------------------------------------
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['update'],
                    },
                },
                description: 'The ID of the task to update',
            },
            {
                displayName: 'Update Fields',
                name: 'updateFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['taskActions'],
                        operation: ['update'],
                    },
                },
                options: [
                    {
                        displayName: 'Name',
                        name: 'name',
                        type: 'string',
                        default: '',
                        description: 'The new name of the task',
                    },
                    {
                        displayName: 'Description',
                        name: 'description',
                        type: 'string',
                        typeOptions: {
                            rows: 4,
                        },
                        default: '',
                        description: 'The new description of the task',
                    },
                    {
                        displayName: 'Status',
                        name: 'status',
                        type: 'options',
                        options: [
                            {
                                name: 'To Do',
                                value: 'todo',
                            },
                            {
                                name: 'In Progress',
                                value: 'inProgress',
                            },
                            {
                                name: 'Done',
                                value: 'done',
                            },
                        ],
                        default: 'todo',
                        description: 'The new status of the task',
                    },
                    {
                        displayName: 'Priority',
                        name: 'priority',
                        type: 'options',
                        options: [
                            {
                                name: 'Low',
                                value: 'low',
                            },
                            {
                                name: 'Medium',
                                value: 'medium',
                            },
                            {
                                name: 'High',
                                value: 'high',
                            },
                        ],
                        default: 'medium',
                        description: 'The priority of the task',
                    },
                    {
                        displayName: 'Due Date',
                        name: 'dueDate',
                        type: 'dateTime',
                        default: '',
                        description: 'The due date of the task',
                    },
                ],
            },
        ],
    };

    methods = {
        loadOptions: {
            // Get all the available workspaces to display them to user
            async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('fiveDayOAuth2Api').catch(() => null);

                if (!credentials || !credentials.oauthTokenData) {
                    return []; // OAuth2 not connected yet
                }

                // Get access token from OAuth data
                const oauthTokenData = credentials.oauthTokenData as IDataObject;
                const accessToken = oauthTokenData.access_token as string;

                if (!accessToken) {
                    return []; // No access token available
                }

                // const baseUrl = 'https://gateway.dev.5daylabs.com';
                const baseUrl = 'http://localhost:41060';
                const platform = 'n8n';
                const entity = 'workspace';

                try {
                    // Fetch workspaces with custom header (5day uses r-day5n8n-api-key, not Authorization)
                    const workspacesResponse = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    // Parse the workspaces response and return as options
                    const workspaces = Array.isArray(workspacesResponse) ? workspacesResponse : workspacesResponse.data || [];

                    return workspaces.map((workspace: IDataObject) => ({
                        name: workspace.name as string,
                        value: workspace.id as string,
                    }));
                } catch (error) {
                    const errorObj = error as JsonObject;
                    const errorMessage = typeof errorObj.message === 'string'
                        ? errorObj.message
                        : 'Unknown error occurred';

                    throw new NodeApiError(this.getNode(), errorObj, {
                        message: 'Failed to load workspaces',
                        description: errorMessage,
                    });
                }
            },
            // Get all the available projects to display them to user
            async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('fiveDayOAuth2Api').catch(() => null);

                if (!credentials || !credentials.oauthTokenData || Object.keys(credentials.oauthTokenData).length === 0) {
                    return []; // OAuth2 not connected yet
                }

                // Get access token from OAuth data
                const oauthTokenData = credentials.oauthTokenData as IDataObject;
                const accessToken = oauthTokenData.access_token as string;

                if (!accessToken) {
                    return []; // No access token available
                }

                // const baseUrl = 'https://gateway.dev.5daylabs.com';
                const baseUrl = 'http://localhost:41060';
                const platform = 'n8n';
                const entity = 'project';

                try {
                    // Fetch projects with custom header (5day uses r-day5n8n-api-key, not Authorization)
                    const projectsResponse = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    const projects = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse.data || [];

                    return projects.map((project: IDataObject) => ({
                        name: project.name as string,
                        value: project.id as string,
                    }));
                } catch (error) {
                    const errorObj = error as JsonObject;
                    const errorMessage = typeof errorObj.message === 'string'
                        ? errorObj.message
                        : 'Unknown error occurred';

                    throw new NodeApiError(this.getNode(), errorObj, {
                        message: 'Failed to load projects',
                        description: errorMessage,
                    });
                }
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        // const baseUrl = 'https://gateway.dev.5daylabs.com';
        const baseUrl = 'http://localhost:41060';

        // Get access token from credentials
        const credentials = await this.getCredentials('fiveDayOAuth2Api');
        const oauthTokenData = credentials.oauthTokenData as IDataObject;
        const accessToken = oauthTokenData.access_token as string;

        for (let i = 0; i < items.length; i++) {
            try {
                // ----------------------------------------
                //         Project Actions - Create
                // ----------------------------------------
                if (resource === 'projectActions' && operation === 'create') {
                    const workspaceId = this.getNodeParameter('workspaceId', i) as string;
                    const name = this.getNodeParameter('name', i) as string;
                    const description = this.getNodeParameter('description', i) as string;
                    const projectWorkflow = true;

                    const body: IDataObject = {
                        name,
                        description,
                        projectWorkflow,
                    };

                    const platform = 'n8n';
                    const entity = 'project';

                    const projectResponse = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                            'workspace-id': workspaceId,
                        },
                        body,
                    });

                    returnData.push({ json: projectResponse as IDataObject });
                }
                // ----------------------------------------
                //         Project Actions - Delete
                // ----------------------------------------
                else if (resource === 'projectActions' && operation === 'delete') {
                    const projectId = this.getNodeParameter('projectId', i) as string;

                    const platform = 'n8n';
                    const entity = 'project';

                    const response = await this.helpers.httpRequest({
                        method: 'DELETE',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${projectId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //         Project Actions - Get
                // ----------------------------------------
                else if (resource === 'projectActions' && operation === 'get') {
                    const projectId = this.getNodeParameter('projectId', i) as string;

                    const platform = 'n8n';
                    const entity = 'project';

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${projectId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //         Project Actions - Get All
                // ----------------------------------------
                else if (resource === 'projectActions' && operation === 'getAll') {
                    const workspaceId = this.getNodeParameter('workspaceId', i) as string;
                    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

                    const platform = 'n8n';
                    const entity = 'project';

                    const qs: IDataObject = {};

                    if (!returnAll) {
                        const limit = this.getNodeParameter('limit', i) as number;
                        qs.limit = limit;
                    }

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                            'workspace-id': workspaceId,
                        },
                        qs,
                    });

                    const projects = Array.isArray(response) ? response : response.data || [];
                    for (const project of projects) {
                        returnData.push({ json: project as IDataObject });
                    }
                }
                // ----------------------------------------
                //         Project Actions - Update
                // ----------------------------------------
                else if (resource === 'projectActions' && operation === 'update') {
                    const projectId = this.getNodeParameter('projectId', i) as string;
                    const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

                    const platform = 'n8n';
                    const entity = 'project';

                    const body: IDataObject = {
                        ...updateFields,
                    };

                    const response = await this.helpers.httpRequest({
                        method: 'PATCH',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${projectId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        body,
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //           Task Actions - Create
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'create') {
                    const projectId = this.getNodeParameter('projectId', i) as string;
                    const taskName = this.getNodeParameter('taskName', i) as string;

                    const body: IDataObject = {
                        name: taskName,
                        projectId,
                    };

                    const platform = 'n8n';
                    const entity = 'task';

                    const taskResponse = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${baseUrl}/api/integration-service/v1/execution/${platform}/event/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        body,
                    });

                    returnData.push({ json: taskResponse as IDataObject });
                }
                // ----------------------------------------
                //           Task Actions - Delete
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'delete') {
                    const taskId = this.getNodeParameter('taskId', i) as string;

                    const platform = 'n8n';
                    const entity = 'task';

                    const response = await this.helpers.httpRequest({
                        method: 'DELETE',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${taskId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //           Task Actions - Get
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'get') {
                    const taskId = this.getNodeParameter('taskId', i) as string;

                    const platform = 'n8n';
                    const entity = 'task';

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${taskId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //           Task Actions - Get All
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'getAll') {
                    const projectId = this.getNodeParameter('projectId', i) as string;
                    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

                    const platform = 'n8n';
                    const entity = 'task';

                    const qs: IDataObject = {
                        projectId,
                    };

                    if (!returnAll) {
                        const limit = this.getNodeParameter('limit', i) as number;
                        qs.limit = limit;
                    }

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        qs,
                    });

                    const tasks = Array.isArray(response) ? response : response.data || [];
                    for (const task of tasks) {
                        returnData.push({ json: task as IDataObject });
                    }
                }
                // ----------------------------------------
                //           Task Actions - Move
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'move') {
                    const taskId = this.getNodeParameter('taskId', i) as string;
                    const targetProjectId = this.getNodeParameter('targetProjectId', i) as string;

                    const platform = 'n8n';
                    const entity = 'task';

                    const body: IDataObject = {
                        taskId,
                        targetProjectId,
                    };

                    const response = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/move`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        body,
                    });

                    returnData.push({ json: response as IDataObject });
                }
                // ----------------------------------------
                //           Task Actions - Search
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'search') {
                    const searchQuery = this.getNodeParameter('searchQuery', i) as string;
                    const projectId = this.getNodeParameter('projectId', i) as string;

                    const platform = 'n8n';
                    const entity = 'task';

                    const qs: IDataObject = {
                        q: searchQuery,
                    };

                    if (projectId) {
                        qs.projectId = projectId;
                    }

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/search`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        qs,
                    });

                    const tasks = Array.isArray(response) ? response : response.data || [];
                    for (const task of tasks) {
                        returnData.push({ json: task as IDataObject });
                    }
                }
                // ----------------------------------------
                //           Task Actions - Update
                // ----------------------------------------
                else if (resource === 'taskActions' && operation === 'update') {
                    const taskId = this.getNodeParameter('taskId', i) as string;
                    const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

                    const platform = 'n8n';
                    const entity = 'task';

                    const body: IDataObject = {
                        ...updateFields,
                    };

                    const response = await this.helpers.httpRequest({
                        method: 'PATCH',
                        url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}/${taskId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        body,
                    });

                    returnData.push({ json: response as IDataObject });
                }
            } catch (error) {
                throw new NodeApiError(this.getNode(), error as JsonObject);
            }
        }

        return [returnData];
    }
}

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
                ],
                default: 'project',
            },
            {
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
                        name: 'Create Task',
                        value: 'createTask',
                        description: 'Create a new task',
                        action: 'Create a task',
                    },
                ],
                default: 'create',
            },
            // Fields for Create Operation
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
                displayName: 'Description',
                name: 'description',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                displayOptions: {
                    show: {
                        resource: ['project'],
                        operation: ['create'],
                    },
                },
                description: 'Description for the project',
            },
            // Fields for Create Task Operation
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
                        resource: ['project'],
                        operation: ['createTask'],
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
                        resource: ['project'],
                        operation: ['createTask'],
                    },
                },
                description: 'The name of the task to create',
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
                if (resource === 'project' && operation === 'create') {
                    // Prepare project data
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

                    // Call create project API with custom header
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

                    // Return the created project
                    returnData.push({ json: projectResponse as IDataObject });
                } else if (resource === 'project' && operation === 'createTask') {
                    // Prepare task data
                    const projectId = this.getNodeParameter('projectId', i) as string;
                    const taskName = this.getNodeParameter('taskName', i) as string;

                    const body: IDataObject = {
                        name: taskName,
                        projectId,
                    };

                    const platform = 'n8n';
                    const entity = 'task';

                    // Call create task API with custom header
                    const taskResponse = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${baseUrl}/api/integration-service/v1/execution/${platform}/event/${entity}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'r-day5n8n-api-key': accessToken,
                        },
                        body,
                    });

                    // Return the created task
                    returnData.push({ json: taskResponse as IDataObject });
                }
            } catch (error) {
                throw new NodeApiError(this.getNode(), error as JsonObject);
            }
        }

        return [returnData];
    }
}

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
import { NodeApiError } from 'n8n-workflow';

export class Fiveday implements INodeType {
    description: INodeTypeDescription = {
        displayName: '5day',
        name: 'fiveday',
        icon: 'file:5day.svg',
        group: ['transform'],
        version: 1,
        usableAsTool: true,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Integrate with 5day project management tool',
        defaults: {
            name: 'fiveday',
        },
        inputs: ['main'],
        outputs: ['main'],
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
                // const baseUrl = 'https://gateway.dev.5daylabs.com';
                const baseUrl = 'http://localhost:41060';
                const platform = 'n8n';
                const entity = 'workspace';

                try {
                    // Fetch workspaces with OAuth2 token (automatically added by n8n)
                    const workspacesResponse = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'fiveDayOAuth2Api',
                        {
                            method: 'GET',
                            url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );

                    // Parse the workspaces response and return as options
                    const workspaces = workspacesResponse as IDataObject[];
                    return workspaces.map((workspace: IDataObject) => ({
                        name: workspace.name as string,
                        value: workspace.id as string,
                    }));
                } catch (error) {
                    throw new NodeApiError(this.getNode(), error as JsonObject, {
                        message: 'Failed to load workspaces',
                    });
                }
            },
            // Get all the available projects to display them to user
            async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                // const baseUrl = 'https://gateway.dev.5daylabs.com';
                const baseUrl = 'http://localhost:41060';
                const platform = 'n8n';
                const entity = 'project';

                try {
                    // Fetch projects with OAuth2 token (automatically added by n8n)
                    const projectsResponse = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'fiveDayOAuth2Api',
                        {
                            method: 'GET',
                            url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );

                    // Parse the projects response and return as options
                    const projects = projectsResponse as IDataObject[];
                    return projects.map((project: IDataObject) => ({
                        name: project.name as string,
                        value: project.id as string,
                    }));
                } catch (error) {
                    throw new NodeApiError(this.getNode(), error as JsonObject, {
                        message: 'Failed to load projects',
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

                    // Call create project API with OAuth2 token (automatically added by n8n)
                    const projectResponse = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'fiveDayOAuth2Api',
                        {
                            method: 'POST',
                            url: `${baseUrl}/api/integration-service/v1/data/${platform}/${entity}`,
                            headers: {
                                'Content-Type': 'application/json',
                                'workspace-id': workspaceId,
                            },
                            body,
                        },
                    );

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

                    // Call create task API with OAuth2 token (automatically added by n8n)
                    const taskResponse = await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'fiveDayOAuth2Api',
                        {
                            method: 'POST',
                            url: `${baseUrl}/api/integration-service/v1/execution/${platform}/event/${entity}`,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body,
                        },
                    );

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

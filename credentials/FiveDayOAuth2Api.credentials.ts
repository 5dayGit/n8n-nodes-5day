import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FiveDayOAuth2Api implements ICredentialType {
	name = 'fiveDayOAuth2Api';

	extends = ['oAuth2Api'];
	icon: Icon = 'file:../icons/5day.svg';

	displayName = '5day OAuth2 API';

	documentationUrl = 'https://docs.5day.io/integrations/n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://login.5day.dev.5daylabs.com/api/login',
			// default: 'https://login.5day.qa.5daylabs.com/api/login',
			// default: 'http://login.localhost:4200/auth/login',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://gateway.dev.5daylabs.com/api/integration/auth/external/n8n/authorize',
			// default: 'https://gateway.qa.5daylabs.com/api/integration/auth/external/n8n/authorize',
			// default: 'http://localhost:41060/api/security/integration/auth/external/n8n/authorize',
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Client ID generated from your 5day.io application integration settings',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Client Secret generated from your 5day.io application integration settings',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'read write',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '5day-integration-platform=n8n',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];
	
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://gateway.dev.5daylabs.com',
			// baseURL: 'https://gateway.qa.5daylabs.com',
			// baseURL: 'http://localhost:41060',
			url: '/api/integration-service/v1/data/n8n/workspace',
			method: 'GET',
		},
	};
}

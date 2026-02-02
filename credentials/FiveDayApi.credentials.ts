import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FiveDayApi implements ICredentialType {
	name = 'fiveDayApi';

	displayName = '5day API';

	icon: Icon = 'file:../icons/5day.svg';

	documentationUrl = 'https://5day.com/docs/api'; // Update with actual 5day API documentation URL

	properties: INodeProperties[] = [
        {
            displayName: 'Username',
            name: 'username',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
        },
	];

    // Test the credentials by calling login API
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://localhost:41060',
			url: '/api/security/login',
			method: 'POST',
            body: {
                username: '={{$credentials.username}}',
                password: '={{$credentials.password}}',
            },
            headers: {
                'Content-Type': 'application/json',
            },
		},
	};
}
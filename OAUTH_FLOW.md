# 5day OAuth2 Integration Flow for n8n

## Overview
This document describes the custom OAuth2 flow required for 5day integration with n8n. The flow uses static client credentials and requires backend implementation to handle the authentication process.

## Static Credentials
- **Client ID**: `5day-n8n-integration`
- **Client Secret**: `5day-n8n-secret-key-2024`

## OAuth2 Flow Sequence

When a user clicks "Connect my account" in n8n, the following flow occurs:

### Step 1: Initial Redirect from n8n
n8n redirects the user to:
```
GET https://localhost:41060/api/integration/auth/external/login?
  platform=n8n&
  client_id=5day-n8n-integration&
  redirect_uri=http://localhost:5678/rest/oauth2-credential/callback&
  response_type=code&
  state={encrypted_state}&
  scope=read+write
```

### Step 2: Display Login Page
**Endpoint**: `GET /api/integration/auth/external/login`

**Backend Implementation**:
1. Display a login page with username and password fields
2. Store the OAuth parameters (client_id, redirect_uri, state, scope, response_type) in the session or as hidden form fields
3. The login form should POST to the authentication endpoint (Step 3)

**Login Page HTML Example**:
```html
<form method="POST" action="/api/integration/auth/external/authenticate">
  <input type="hidden" name="platform" value="n8n" />
  <input type="hidden" name="client_id" value="{from_query}" />
  <input type="hidden" name="redirect_uri" value="{from_query}" />
  <input type="hidden" name="state" value="{from_query}" />
  <input type="hidden" name="scope" value="{from_query}" />
  <input type="hidden" name="response_type" value="{from_query}" />

  <input type="text" name="username" placeholder="Username" required />
  <input type="password" name="password" placeholder="Password" required />
  <button type="submit">Login</button>
</form>
```

### Step 3: Authenticate User
**Endpoint**: `POST /api/integration/auth/external/authenticate`

**Request Body**:
```json
{
  "username": "user@example.com",
  "password": "userPassword123",
  "platform": "n8n"
}
```

**Response** (IntegrationLoginResponse):
```json
{
  "failed": false,
  "defaultUserId": "uuid-user-id",
  "defaultTenantId": "uuid-tenant-id",
  "firstName": "John",
  "lastName": "Doe",
  "accessToken": "short-lived-token",
  "token": {
    "access_token": "keycloak-token",
    "expires_in": 300,
    "refresh_token": "refresh-token",
    "token_type": "Bearer"
  },
  "tenantList": [
    {
      "id": "tenant-id-1",
      "accountUrl": "https://account1.5day.com",
      "accountName": "Account 1",
      "userId": "user-id-1",
      "fullName": "John Doe",
      "imageId": "image-id"
    }
  ]
}
```

**Backend Action**:
- Validate username and password
- Return user details and access token
- Store userId and tenantId in session for next step

### Step 4: Connect Integration
**Endpoint**: `POST /api/integration/auth/connect`

**Request Body**:
```json
{
  "userId": "uuid-from-step-3",
  "tenantId": "uuid-from-step-3",
  "platform": "n8n",
  "client_id": "5day-n8n-integration",
  "scope": "read write",
  "state": "{state_from_query_params}",
  "redirect_uri": "http://localhost:5678/rest/oauth2-credential/callback",
  "response_type": "code",
  "requestParam": {
    "username": "user@example.com",
    "accessToken": "token-from-step-3"
  }
}
```

**Response** (IntegrationConnectResponse):
```json
{
  "success": true,
  "message": "Connection successful",
  "redirectionUrl": "http://localhost:5678/rest/oauth2-credential/callback?code=AUTH_CODE_123&state={state}",
  "emailVerified": true
}
```

**Backend Action - CRITICAL**:
- Create an authorization code
- Generate redirection URL with code and state
- **IMPORTANT**: Perform an HTTP redirect (302 or 303) to the `redirectionUrl`

**IMPORTANT - Backend Must Redirect**:
Your backend MUST NOT just return the JSON response. After generating the `redirectionUrl`, you must perform an actual HTTP redirect:

```java
// Java/Spring Boot example
return ResponseEntity
    .status(HttpStatus.FOUND) // 302
    .location(URI.create(connectResponse.getRedirectionUrl()))
    .build();

// OR
response.sendRedirect(connectResponse.getRedirectionUrl());
```

The browser must be redirected to n8n's callback URL with the authorization code. If you just return JSON, the user stays on your 5day portal page and n8n never receives the authorization code.

### Step 5: User Redirected Back to n8n
The browser redirects to:
```
GET http://localhost:5678/rest/oauth2-credential/callback?
  code=AUTH_CODE_123&
  state={state}
```

### Step 6: n8n Exchanges Code for Token
n8n automatically calls the Access Token URL with the authorization code:

**Endpoint**: `POST /api/integration/auth/external/n8n/authorize`

**Content-Type**: `application/x-www-form-urlencoded`

**Request Body**:
```
code=AUTH_CODE_123&
client_id=5day-n8n-integration&
client_secret=5day-n8n-secret-key-2024&
redirect_uri=http://localhost:5678/rest/oauth2-credential/callback&
grant_type=authorization_code
```

**Response** (IntegrationAuthorizationResponse):
```json
{
  "failed": false,
  "message": "Authorization successful",
  "access_token": "LONG_LIVED_ACCESS_TOKEN_12345"
}
```

**Backend Action**:
- Validate the authorization code
- Validate client_id and client_secret
- Generate a long-lived access token
- Return the access token to n8n

### Step 7: Token Storage
n8n automatically stores the `access_token` securely and will use it for all subsequent API calls.

## API Calls Using Stored Token

Once authenticated, all API calls will include the stored access token:

### Example: List Workspaces
```
GET https://localhost:41060/api/integration-service/v1/data/n8n/workspace
Authorization: Bearer LONG_LIVED_ACCESS_TOKEN_12345
```

### Example: Create Project
```
POST https://localhost:41060/api/integration-service/v1/data/n8n/project
Authorization: Bearer LONG_LIVED_ACCESS_TOKEN_12345
workspace-id: {workspace-id}

{
  "name": "New Project",
  "description": "Project description",
  "projectWorkflow": true
}
```

## Backend Implementation Checklist

- [ ] Implement `GET /api/integration/auth/external/login` to display login page
- [ ] Login page must preserve OAuth query parameters (client_id, redirect_uri, state, scope, response_type)
- [ ] Implement `POST /api/integration/auth/external/authenticate` to validate credentials
- [ ] Store userId and tenantId in session after successful authentication
- [ ] Implement `POST /api/integration/auth/connect` to generate authorization code
- [ ] Generate and store authorization codes with expiration (5-10 minutes)
- [ ] Redirect to n8n callback URL with code and state
- [ ] Implement `POST /api/integration/auth/external/n8n/authorize` to exchange code for token
- [ ] Validate authorization code before issuing access token
- [ ] Validate static client_id and client_secret
- [ ] Generate long-lived access tokens (recommended: JWT with 30-90 day expiration)
- [ ] Store token-to-user mapping for API authentication
- [ ] Implement token validation middleware for protected API endpoints

## Security Considerations

1. **State Parameter**: Validate the state parameter to prevent CSRF attacks
2. **Authorization Code**: Single-use codes that expire after 5-10 minutes
3. **HTTPS Only**: All OAuth endpoints must use HTTPS in production
4. **Token Security**: Store tokens securely with encryption
5. **Client Secret**: Keep the client secret secure (currently hardcoded in n8n)
6. **Access Token**: Use JWT tokens with proper expiration and refresh mechanism

## Testing the Flow

1. In n8n, go to Credentials → Add New → 5day OAuth2 API
2. Click "Connect my account"
3. You should be redirected to your 5day login page
4. Enter username and password
5. After successful authentication, you should be redirected back to n8n
6. The credential should now show as "Connected"
7. Use the credential in the 5day node to list workspaces and create projects

## Troubleshooting

- **Login page not showing**: Check that `GET /api/integration/auth/external/login` is accessible
- **Authentication fails**: Verify username/password validation in authenticate endpoint
- **No redirect to n8n**: Check that connect endpoint returns proper redirectionUrl
- **Token exchange fails**: Verify authorization code is valid and client credentials match
- **API calls fail**: Verify access token is being passed correctly in Authorization header

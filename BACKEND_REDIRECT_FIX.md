# Backend Redirect Issue - Fix Required

## Problem

After the user logs in and selects a tenant, the `/api/integration/auth/connect` endpoint returns a JSON response containing the `redirectionUrl`:

```json
{
  "success": true,
  "message": null,
  "redirectionUrl": "http://localhost:5678/rest/oauth2-credential/callback?code=73ca9841-c1eb-49d1-9a56-0cf2ef85e02f&state=...",
  "emailVerified": true
}
```

However, the browser stays on the 5day portal instead of redirecting to n8n. This breaks the OAuth flow because n8n never receives the authorization code.

## Root Cause

The backend is returning the `redirectionUrl` as JSON data instead of performing an actual HTTP redirect. When you return JSON, the browser doesn't know it should navigate to that URL.

## Solution

Your backend endpoint must perform an **HTTP 302 or 303 redirect** to the `redirectionUrl` instead of returning JSON.

### Current Implementation (WRONG):

```java
@PostMapping(value = "/connect")
public ResponseEntity<IntegrationConnectResponse> connect(
        @RequestBody IntegrationConnectRequest connectRequestDTO,
        HttpServletRequest request
) throws Exception {
    IntegrationConnectResponse connectResponseDTO = authService.connect(connectRequestDTO, request);
    if (connectResponseDTO.isSuccess()) {
        // WRONG: This returns JSON to the frontend
        return ResponseEntity.ok().body(connectResponseDTO);
    } else {
        return ResponseEntity.badRequest().body(connectResponseDTO);
    }
}
```

### Fixed Implementation (CORRECT):

```java
@PostMapping(value = "/connect")
public ResponseEntity<Void> connect(
        @RequestBody IntegrationConnectRequest connectRequestDTO,
        HttpServletRequest request
) throws Exception {
    IntegrationConnectResponse connectResponseDTO = authService.connect(connectRequestDTO, request);

    if (connectResponseDTO.isSuccess()) {
        // CORRECT: Perform HTTP redirect to n8n callback
        return ResponseEntity
            .status(HttpStatus.FOUND) // 302 redirect
            .location(URI.create(connectResponseDTO.getRedirectionUrl()))
            .build();
    } else {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .build();
    }
}
```

### Alternative Implementation Using HttpServletResponse:

```java
@PostMapping(value = "/connect")
public void connect(
        @RequestBody IntegrationConnectRequest connectRequestDTO,
        HttpServletRequest request,
        HttpServletResponse response
) throws Exception {
    IntegrationConnectResponse connectResponseDTO = authService.connect(connectRequestDTO, request);

    if (connectResponseDTO.isSuccess()) {
        // CORRECT: Redirect using HttpServletResponse
        response.sendRedirect(connectResponseDTO.getRedirectionUrl());
    } else {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
}
```

## Key Changes

1. **Return Type**: Change from `ResponseEntity<IntegrationConnectResponse>` to `ResponseEntity<Void>` (or use void with HttpServletResponse)

2. **Status Code**: Use `HttpStatus.FOUND` (302) or `HttpStatus.SEE_OTHER` (303) for redirect

3. **Location Header**: Set the `Location` header to the `redirectionUrl` value

4. **No Body**: Don't return the JSON body - the redirect is the response

## Testing the Fix

### Before Fix:
1. User logs in successfully
2. Browser shows JSON response or stays on 5day portal
3. n8n never receives the authorization code
4. OAuth flow fails

### After Fix:
1. User logs in successfully
2. Browser automatically redirects to: `http://localhost:5678/rest/oauth2-credential/callback?code=73ca9841-c1eb-49d1-9a56-0cf2ef85e02f&state=...`
3. n8n receives the authorization code
4. n8n calls `/api/integration/auth/external/n8n/authorize` to exchange code for token
5. OAuth flow completes successfully

## Complete Flow After Fix

```
1. User clicks "Connect my account" in n8n
   ↓
2. n8n redirects to: https://login.5day.dev.5daylabs.com/api/login?...
   ↓
3. User sees 5day login page, enters username/password
   ↓
4. Backend calls POST /api/integration/auth/external/authenticate
   ↓
5. User selects tenant
   ↓
6. Frontend calls POST /api/integration/auth/connect
   ↓
7. Backend generates authorization code and redirectionUrl
   ↓
8. Backend performs HTTP 302 redirect to redirectionUrl
   ↓
9. Browser navigates to: http://localhost:5678/rest/oauth2-credential/callback?code=...
   ↓
10. n8n receives the code and exchanges it for access token
    ↓
11. n8n calls POST /api/integration/auth/external/n8n/authorize
    ↓
12. Backend validates code and returns access_token
    ↓
13. n8n stores the access token
    ↓
14. OAuth flow complete! ✅
```

## Important Notes

- The redirect must happen **server-side** (HTTP 302/303)
- Do NOT rely on JavaScript to redirect after receiving JSON
- The `state` parameter must be preserved in the redirect URL
- The authorization code should be single-use and expire after 5-10 minutes
- Validate the authorization code before issuing the access token

## Common Mistakes to Avoid

❌ Returning JSON and expecting frontend to redirect
❌ Using JavaScript `window.location.href` to redirect
❌ Forgetting to include the `state` parameter
❌ Not validating the authorization code in the token exchange endpoint
❌ Using HTTP 200 status instead of 302/303

✅ Use HTTP 302 or 303 redirect
✅ Include both `code` and `state` in the redirect URL
✅ Validate authorization code is valid and not expired
✅ Make authorization codes single-use

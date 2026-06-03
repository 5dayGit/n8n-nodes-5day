# n8n-nodes-5day

An [n8n](https://n8n.io) community node that integrates [5day.io](https://5day.io) with n8n workflows.

This node allows you to automate project management tasks such as creating projects, managing tasks and subtasks, posting comments, managing tags, and retrieving users directly inside your n8n automations.

5day.io is a minimalist project management tool that helps teams plan, track, and finish work without the noise.

## Supported Resources & Operations

| Resource        | Operations                                          |
| --------------- | --------------------------------------------------- |
| Project         | Create, Delete, Get, Get Many, Update               |
| Task            | Create, Delete, Get, Get Many, Move, Search, Update |
| Subtask         | Create, Get Many                                    |
| Task Assignee   | Add Assignee, Remove Assignee                       |
| Task Comment    | Create, Delete                                      |
| Task Link       | Add Link, Remove Link                               |
| Task Tag        | Add Tag, Remove Tag                                 |
| User            | Get, Get Many                                       |

## Installation

### n8n Cloud / Self-hosted via GUI

1. Open **n8n**.
2. Go to **Settings → Community Nodes**.
3. Click **Install a community node**.
4. Enter the package name:

 `n8n-nodes-5day`

5. Click **Install**.

### Install via npm (Self-hosted)
If you are running a self-hosted n8n instance:
```bash
npm install n8n-nodes-5day
```
Restart your **n8n instance** after installation.

## Authentication

This node uses **OAuth2** (Authorization Code flow) to authenticate with the 5day API.

You will need the following credentials from your 5day account:
- **Client ID**
- **Client Secret**

## Setup Steps

1. Log in to your 5day.io account.

2. Open **n8n** and create a new credential of type **5day OAuth2 API**.

3. Copy the **Redirect URL** displayed in the credential configuration.

4. Navigate to **My Settings → Integration Center → Automation → n8n** in 5day.io.

5. Paste the Redirect URL into the **Redirect URL** field and generate your **Client ID** and **Client Secret**.

7. Enter the generated **Client ID** and **Client Secret** in the **5day OAuth2 API** credential in n8n.

8. Click **Connect** to start the OAuth authentication flow.

9. You will be redirected to the 5day.io login page. Sign in using your 5day.io credentials.

10. If your user account has access to multiple 5day.io accounts (multi-tenant setup), select the account you want to authorize.

11. After successful authentication and account selection, the OAuth process will complete automatically and the credential will be connected.

12. The authenticated credential can now be reused across multiple n8n workflows.

## Usage

### Project — Create

Creates a new project in a workspace.

**Required fields:** Workspace, Project Name

**Optional fields:** Space, Description, Budget Type, Start Date, End Date, Priority, Status, Client, Progress, Prefix

### Project — Delete

Deletes an existing project.

**Required fields:** Project

### Project — Get

Retrieves a single project by ID.

**Required fields:** Project

### Project — Get Many

Retrieves multiple projects within a workspace.

**Optional filters:** Space

**Supports:** Return All (auto-pagination) or limit by count.

### Project — Update

Updates an existing project.

**Required fields:** Workspace, Project

**Optional fields:** Name, Description, Budget Type, Start Date, End Date, Priority, Status, Client, Progress, Prefix

### Task — Create

Creates a new task within a project.

**Required fields:** Project, Work Item Type, Task Name

**Optional fields:** Section, Assignees, Description, Start Date, Due Date, Priority, Status, Tags, Story Point, Estimation, Linked Tasks, Progress, Budget Type, Custom Fields

### Task — Delete

Deletes an existing task.

**Required fields:** Task ID

### Task — Get

Retrieves a single task by ID.

**Required fields:** Task ID

### Task — Get Many

Retrieves tasks from a project.

**Optional filters:** Section

**Supports:** Return All or limit by count.

### Task — Move

Moves a task to a different project or section.

**Required fields:** Task ID, Project, Section

### Task — Search

Search for tasks using full-text search.

**Supports:** Return All or limit by count.

### Task — Update

Updates an existing task.

**Required fields:** Task ID, Project

**Optional fields:** Name, Work Item Type, Section, Description, Start Date, Due Date, Priority, Status, Story Point, Estimation, Progress, Budget Type, Custom Fields

**Note:** To manage assignees and links, use the Task Assignee and Task Link resources respectively.

### Subtask — Create

Creates a subtask under an existing parent task.

**Required fields:** Project, Work Item Type, Parent Task, Subtask Name

**Optional fields:** Section, Assignee, Description, Start Date, Due Date, Priority, Status, Tags, Story Point, Estimation, Progress, Budget Type, Linked Tasks, Custom Fields

### Subtask — Get Many

Retrieves all subtasks under a parent task.

### Task Comment — Create

Adds a comment to a task.

**Required fields:** Project, Task ID, Comment

### Task Comment — Delete

Removes a comment from a task.

**Required fields:** Comment ID

### Task Tag — Add Tag

Adds one or more tags to a task.

**Required fields:** Task ID, Project, Tags

### Task Tag — Remove Tag

Removes one or more tags from a task.

**Required fields:** Task ID, Project, Tags

### Task Assignee — Add Assignee

Adds one or more assignees to a task.

**Required fields:** Task ID, Project, Assignees

### Task Assignee — Remove Assignee

Removes one or more assignees from a task.

**Required fields:** Task ID, Project, Assignees

### Task Link — Add Link

Links one or more tasks to the current task.

**Required fields:** Task ID, Project, Linked Task IDs

### Task Link — Remove Link

Unlinks one or more tasks from the current task.

**Required fields:** Task ID, Project, Linked Task IDs

### User — Get

Retrieves a single user by ID.

**Required fields:** User ID

### User — Get Many

Retrieves users.

**Optional filters:** Workspace, Project

**Supports:** Return All (auto-pagination) or limit by count.

## Compatibility

- **n8n version:** 1.0 or newer
- **Node.js version:** 18+

## License

This project is licensed under the [MIT](LICENSE.md) License.

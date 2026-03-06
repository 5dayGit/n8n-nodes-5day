# n8n-nodes-5day

An [n8n](https://n8n.io) community node for integrating with [5day.io](https://5day.io) — a project management platform. This node lets you automate project creation, task management, subtasks, comments, and user lookups directly from your n8n workflows.

## Supported Resources & Operations

| Resource      | Operations                  |
| ------------- | --------------------------- |
| Project       | Create, Get Many            |
| Task          | Create, Get Many, Search    |
| Subtask       | Create, Get Many            |
| Task Comment  | Create                      |
| User          | Get Many                    |

## Authentication

This node uses **OAuth2** (Authorization Code flow) to connect to 5day.io.

You will need:
- A **Client ID** and **Client Secret** from your 5day.io application integration settings.

### Setup Steps

1. In your 5day.io account, navigate to **My Settings → Integration center → Automation -> n8n** and generate a client id and secret.
2. Copy the **Client ID** and **Client Secret**.
3. In n8n, add a new credential of type **5day OAuth2 API**.
4. Enter the Client ID and Client Secret and complete the OAuth2 authorization flow.

## Installation

### n8n Cloud / Self-hosted via GUI

1. Go to **Settings → Community Nodes**.
2. Click **Install a community node**.
3. Enter `n8n-nodes-5day` and click **Install**.

### Self-hosted via npm (Docker / custom setup)

```bash
npm install n8n-nodes-5day
```

Restart your n8n instance after installation.

## Usage

### Project — Create

Creates a new project in a workspace.

**Required fields:** Workspace, Project Name

**Optional fields:** Space, Description, Budget Type, Start Date, End Date, Priority, Status, Client, Progress, Prefix

### Project — Get Many

Retrieves all projects in a workspace. Optionally filter by Space.

**Supports:** Return All (auto-pagination) or limit by count.

### Task — Create

Creates a new task inside a project.

**Required fields:** Project, Work Item Type, Task Name

**Optional fields:** Section, Assignees, Description, Start Date, Due Date, Priority, Status, Tags, Story Point, Estimation, Linked Tasks, Custom Fields

### Task — Get Many

Retrieves all tasks in a project. Optionally filter by Section.

**Supports:** Return All or limit by count.

### Task — Search

Full-text search across all work items.

**Supports:** Return All or limit by count.

### Subtask — Create

Creates a subtask linked to a parent task.

**Required fields:** Project, Work Item Type, Parent Task, Subtask Name

**Optional fields:** Section, Assignees, Description, Start Date, Due Date, Priority, Status, Tags, Story Point, Estimation, Linked Tasks, Custom Fields

### Subtask — Get Many

Retrieves all subtasks under a parent task.

### Task Comment — Create

Adds a comment to a task.

**Required fields:** Project, Task, Comment Message

### User — Get Many

Retrieves users. Optionally filter by Workspace or Project.

## Compatibility

- **n8n version:** 1.0+
- **Node.js version:** 18+

## License

[MIT](LICENSE.md)

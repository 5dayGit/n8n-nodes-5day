# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-03-01

### Added
- Initial public release of the 5day.io n8n community node
- **Project** resource: Create and Get Many operations
- **Task** resource: Create, Get Many, and Search operations
- **Subtask** resource: Create and Get Many operations
- **Task Comment** resource: Create operation
- **User** resource: Get Many operation
- OAuth2 Authorization Code authentication via 5day.io Identity Provider
- Dynamic dropdown loading for workspaces, spaces, projects, work item types, sections, clients, priorities, statuses, users, and tags
- Automatic pagination support (return all items or limit by count)
- Custom attributes support via JSON input
- Date range validation for start/end dates
- `usableAsTool` support for AI agent workflows

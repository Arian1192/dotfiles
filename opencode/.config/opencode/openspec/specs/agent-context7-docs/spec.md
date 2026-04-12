## ADDED Requirements

### Requirement: Selective Context7 usage for external documentation
The system SHALL make Context7 available for agents and subagents to use when a task depends on third-party library APIs, framework configuration, setup instructions, or other version-sensitive external documentation.

#### Scenario: Agent uses Context7 for a library API question
- **WHEN** a user request depends on current documentation for a third-party library or framework
- **THEN** the responsible agent uses Context7 before answering or implementing work that depends on that external API behavior

### Requirement: Shared workspace-level Context7 integration
The system SHALL provide a single workspace-level Context7 integration that can be used by primary agents and eligible subagents without requiring duplicate per-agent installation steps.

#### Scenario: Maintainer configures Context7 once
- **WHEN** a maintainer enables Context7 for this OpenCode workspace
- **THEN** the shared OpenCode configuration exposes one Context7 integration that the relevant agents can use

### Requirement: Context7 remains optional for repository-local work
The system SHALL NOT require Context7 for tasks that can be completed using repository-local context alone.

#### Scenario: Agent skips Context7 for local-only work
- **WHEN** a request only involves local files, prompts, or configuration already present in the workspace
- **THEN** the responsible agent completes the task without needing a Context7 lookup

### Requirement: Safe secret handling for Context7 configuration
The system SHALL support Context7 setup without requiring committed API secrets in tracked repository files.

#### Scenario: Maintainer enables Context7 without checking in secrets
- **WHEN** a maintainer configures Context7 with optional higher-rate-limit credentials
- **THEN** the setup keeps those credentials out of tracked files committed to the repository

### Requirement: Graceful fallback when Context7 is unavailable
The system SHALL allow agents to continue working when Context7 is unavailable, while making the limitation visible when it materially affects confidence.

#### Scenario: Context7 cannot be reached
- **WHEN** the agent cannot access Context7 during a task that would normally benefit from external docs
- **THEN** the agent continues using local context and clearly notes that current external documentation could not be retrieved

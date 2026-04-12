## ADDED Requirements

### Requirement: Optional post-response voice rendering
The system SHALL allow final user-facing assistant delivery to include an optional post-response voice-rendering step without changing the dispatcher’s contract-first routing model.

#### Scenario: Voice rendering does not alter routing decisions
- **WHEN** voice output is enabled for assistant replies
- **THEN** the dispatcher, contract planner, specialists, integrator, and reviewer continue to operate on the same text-first workflow and voice rendering occurs only after final response generation

#### Scenario: Voice failure does not invalidate final delivery
- **WHEN** the final text response has already been produced and the optional voice-rendering step fails
- **THEN** the system treats the text response as the successful delivery artifact and does not retroactively fail the completed agent workflow

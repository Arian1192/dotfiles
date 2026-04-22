## Context

The Dispatcher is the primary routing authority in this OpenCode setup. The current wording in the prompt can be read as allowing the Dispatcher to implement work directly, which is exactly the behavior we want to prevent.

This change makes the Dispatcher a coordination-only role: it decides the path, delegates implementation to specialists when needed, and never produces implementation code itself.

## Goals / Non-Goals

**Goals:**
- Make the Dispatcher's no-code boundary explicit.
- Remove ambiguous wording that suggests direct implementation.
- Keep the existing contract-first hybrid model intact.

**Non-Goals:**
- Redesigning the agent architecture.
- Changing how backend/frontend/security specialists work.
- Adding new runtime enforcement beyond prompt and documentation clarity.

## Decisions

### 1. Replace "implement directly" with coordination-only language

The Dispatcher prompt should state that it routes work, selects the correct path, and hands implementation off to the appropriate agent(s).

### 2. Preserve the single-agent path as a routing decision

"Single-agent" should mean the Dispatcher handles coordination without opening a parallel work cell, not that the Dispatcher writes product code.

### 3. Make the no-code boundary visible in architecture docs

The architecture summary should clearly say that the Dispatcher does not author implementation changes.

## Risks / Trade-offs

- If the boundary is too vague, future edits may reintroduce implementation language.
- If the wording is too strict, it may look like the Dispatcher cannot do any useful work; the docs should preserve its routing/coordination responsibility.

## Migration Plan

1. Update the Dispatcher prompt.
2. Update the architecture summary and flow text.
3. Validate that the change spec and tasks match the actual behavior boundary.

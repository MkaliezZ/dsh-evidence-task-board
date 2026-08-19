# dsh-evidence-task-board

Persistent, deterministic task-state primitives for DeepSeek Harness (DSH).

## v0.1
- task create/status/evidence transitions
- stable SHA-256 board digest
- human-readable board rendering
- DSH command adapter with host-supplied persistence

The plugin does not invent hidden autonomous tasks and does not execute tools. Persistence is explicitly supplied by the host.

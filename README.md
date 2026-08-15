# dsh-task-board

A small persistent task board for DeepSeek Harness (DSH).

`/task` turns a long coding session into explicit work state instead of forcing users to reconstruct progress from chat history.

## v0.1.0

Commands:

```text
/task list
/task add <title>
/task start <id>
/task done <id>
/task block <id> [reason]
/task reopen <id>
/task clear-done
```

The board is stored in `.dsh-task-board.json` in the configured project root. Writes happen only after an explicit `/task` mutation command. The store uses deterministic IDs (`T0001`, `T0002`, ...), schema versioning, atomic replace, and strict validation.

## Why this is not DSH session persistence

DSH session history answers **what happened**. This plugin maintains **what work remains and its current state**. It does not rewrite DSH's session log or claim that task state proves execution.

## Non-claims

- Not a project-management service.
- Task completion is user/agent-declared state, not proof that code is correct.
- v0.1 has no multi-user synchronization or remote backend.

MIT licensed.
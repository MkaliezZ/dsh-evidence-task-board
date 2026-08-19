import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { applyTaskCommand, normalizeBoard, renderBoard, type TaskBoard, type TaskStatus } from './core.js'

export const name = 'task-board'
export const inject = ['commands']

export interface Config { storagePath?: string }

function fileStorage(storagePath: string) {
  return {
    async load(): Promise<TaskBoard> {
      try {
        const raw = await readFile(storagePath, 'utf8')
        return normalizeBoard(JSON.parse(raw) as TaskBoard)
      } catch {
        return normalizeBoard()
      }
    },
    async save(board: TaskBoard): Promise<void> {
      await writeFile(storagePath, JSON.stringify(normalizeBoard(board), null, 2) + '\n', 'utf8')
    },
  }
}

export function apply(ctx: any, config: Config = {}): void {
  const storagePath = config.storagePath ?? path.join(process.cwd(), 'dsh-task-board.json')
  const storage = fileStorage(storagePath)

  ctx.commands.register({
    name: 'task-board',
    description: 'Render the persistent deterministic task board.',
    recordInput: false,
    async handler() {
      try {
        return { kind: 'success', text: renderBoard(await storage.load()) || '(board is empty)' }
      } catch (error) {
        return { kind: 'error', text: `task-board failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
  ctx.commands.register({
    name: 'task-create',
    description: 'Create a task on the board.',
    input: { hint: '<task-id> <title>' },
    recordInput: false,
    async handler(invocation: any) {
      const [id = '', ...rest] = String(invocation.rawInput ?? '').trim().split(/\s+/)
      const title = rest.join(' ')
      if (!id || !title) return { kind: 'error', text: 'usage: /task-create <task-id> <title>' }
      try {
        const board = applyTaskCommand(await storage.load(), { type: 'create', id, title })
        await storage.save(board)
        return { kind: 'success', text: renderBoard(board) }
      } catch (error) {
        return { kind: 'error', text: `task-create failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
  ctx.commands.register({
    name: 'task-status',
    description: 'Transition a task status.',
    input: { hint: '<task-id> <todo|in_progress|blocked|done>' },
    recordInput: false,
    async handler(invocation: any) {
      const [id = '', status] = String(invocation.rawInput ?? '').trim().split(/\s+/)
      if (!id || !status) return { kind: 'error', text: 'usage: /task-status <task-id> <status>' }
      try {
        const board = applyTaskCommand(await storage.load(), { type: 'status', id, status: status as TaskStatus })
        await storage.save(board)
        return { kind: 'success', text: renderBoard(board) }
      } catch (error) {
        return { kind: 'error', text: `task-status failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
  ctx.commands.register({
    name: 'task-evidence',
    description: 'Append an evidence string to a task.',
    input: { hint: '<task-id> <evidence>' },
    recordInput: false,
    async handler(invocation: any) {
      const [id = '', ...rest] = String(invocation.rawInput ?? '').trim().split(/\s+/)
      const value = rest.join(' ')
      if (!id || !value) return { kind: 'error', text: 'usage: /task-evidence <task-id> <evidence>' }
      try {
        const board = applyTaskCommand(await storage.load(), { type: 'evidence', id, value })
        await storage.save(board)
        return { kind: 'success', text: renderBoard(board) }
      } catch (error) {
        return { kind: 'error', text: `task-evidence failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
}
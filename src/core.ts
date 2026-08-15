import { createHash } from 'node:crypto';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  parentId: string | null;
  evidence: string[];
}
export interface TaskBoard { version: 1; tasks: Task[]; }
export type TaskCommand =
  | { type: 'create'; id: string; title: string; parentId?: string | null }
  | { type: 'status'; id: string; status: TaskStatus }
  | { type: 'evidence'; id: string; value: string };

type TaskInput = Partial<Task> & { id: unknown; title: unknown };
type BoardInput = { version?: number; tasks?: TaskInput[] };
const VALID = new Set<TaskStatus>(['todo', 'in_progress', 'blocked', 'done']);
const isTaskStatus = (value: unknown): value is TaskStatus => typeof value === 'string' && VALID.has(value as TaskStatus);

export function normalizeBoard(board: BoardInput = { version: 1, tasks: [] }): TaskBoard {
  const tasks = [...(board.tasks ?? [])].map((task) => ({
    id: String(task.id),
    title: String(task.title),
    status: isTaskStatus(task.status) ? task.status : 'todo',
    parentId: task.parentId == null ? null : String(task.parentId),
    evidence: [...(task.evidence ?? [])].map(String),
  }));
  tasks.sort((a, b) => a.id.localeCompare(b.id));
  return { version: 1, tasks };
}

export function applyTaskCommand(board: BoardInput, command: TaskCommand): TaskBoard {
  const next = normalizeBoard(board);
  if (command.type === 'create') {
    if (next.tasks.some((task) => task.id === command.id)) throw new Error('duplicate task id');
    next.tasks.push({ id: String(command.id), title: String(command.title), status: 'todo', parentId: command.parentId ?? null, evidence: [] });
  } else {
    const task = next.tasks.find((item) => item.id === String(command.id));
    if (!task) throw new Error('task not found');
    if (command.type === 'status') task.status = command.status;
    else task.evidence.push(String(command.value));
  }
  return normalizeBoard(next);
}

export function boardDigest(board: BoardInput): string {
  return createHash('sha256').update(JSON.stringify(normalizeBoard(board))).digest('hex');
}

export function renderBoard(board: BoardInput): string {
  const symbols: Record<TaskStatus, string> = { todo: '○', in_progress: '●', blocked: '!', done: '✓' };
  return normalizeBoard(board).tasks.map((task) => `${symbols[task.status]} ${task.id} ${task.title}`).join('\n');
}

import { applyTaskCommand, renderBoard, type TaskBoard, type TaskStatus } from './core.js';

interface CommandContext {
  command?: (name: string, handler: (...args: string[]) => unknown | Promise<unknown>) => unknown;
}
interface TaskBoardStorage {
  load: () => Promise<TaskBoard> | TaskBoard;
  save: (board: TaskBoard) => Promise<void> | void;
}

export function registerTaskBoard(ctx: CommandContext, { load, save }: TaskBoardStorage): void {
  ctx.command?.('task-board', async () => renderBoard(await load()));
  ctx.command?.('task-create', async (id, title) => {
    const board = applyTaskCommand(await load(), { type: 'create', id, title });
    await save(board);
    return renderBoard(board);
  });
  ctx.command?.('task-status', async (id, status) => {
    const board = applyTaskCommand(await load(), { type: 'status', id, status: status as TaskStatus });
    await save(board);
    return renderBoard(board);
  });
}

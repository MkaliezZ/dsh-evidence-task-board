import {applyTaskCommand,renderBoard} from './core.js';
export function registerTaskBoard(ctx,{load,save}){
  ctx.command?.('task-board', async ()=>renderBoard(await load()));
  ctx.command?.('task-create', async (id,title)=>{const b=applyTaskCommand(await load(),{type:'create',id,title}); await save(b); return renderBoard(b);});
  ctx.command?.('task-status', async (id,status)=>{const b=applyTaskCommand(await load(),{type:'status',id,status}); await save(b); return renderBoard(b);});
}

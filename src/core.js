import { createHash } from 'node:crypto';

const VALID = new Set(['todo','in_progress','blocked','done']);
export function normalizeBoard(board={version:1,tasks:[]}) {
  const tasks=[...(board.tasks??[])].map(t=>({id:String(t.id),title:String(t.title),status:VALID.has(t.status)?t.status:'todo',parentId:t.parentId??null,evidence:[...(t.evidence??[])].map(String)}));
  tasks.sort((a,b)=>a.id.localeCompare(b.id));
  return {version:1,tasks};
}
export function applyTaskCommand(board, command) {
  const next=normalizeBoard(board); const c={...command};
  if(c.type==='create') { if(next.tasks.some(t=>t.id===c.id)) throw new Error('duplicate task id'); next.tasks.push({id:String(c.id),title:String(c.title),status:'todo',parentId:c.parentId??null,evidence:[]}); }
  else { const t=next.tasks.find(x=>x.id===String(c.id)); if(!t) throw new Error('task not found');
    if(c.type==='status'){ if(!VALID.has(c.status)) throw new Error('invalid status'); t.status=c.status; }
    else if(c.type==='evidence'){ t.evidence.push(String(c.value)); }
    else throw new Error('unknown command');
  }
  return normalizeBoard(next);
}
export function boardDigest(board){ return createHash('sha256').update(JSON.stringify(normalizeBoard(board))).digest('hex'); }
export function renderBoard(board){ const b=normalizeBoard(board); const sym={todo:'○',in_progress:'●',blocked:'!',done:'✓'}; return b.tasks.map(t=>`${sym[t.status]} ${t.id} ${t.title}`).join('\n'); }

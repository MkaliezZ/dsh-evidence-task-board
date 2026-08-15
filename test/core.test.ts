import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTaskCommand, boardDigest, renderBoard } from '../src/core.js';

test('creates and updates tasks deterministically', () => {
  let board = applyTaskCommand({ tasks: [] }, { type: 'create', id: '1', title: 'Inspect' });
  board = applyTaskCommand(board, { type: 'status', id: '1', status: 'done' });
  assert.match(renderBoard(board), /✓ 1 Inspect/);
  assert.equal(boardDigest(board), boardDigest(board));
});

test('rejects duplicates', () => {
  const board = applyTaskCommand({ tasks: [] }, { type: 'create', id: '1', title: 'x' });
  assert.throws(() => applyTaskCommand(board, { type: 'create', id: '1', title: 'y' }));
});

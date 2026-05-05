import * as assert from 'assert';
import * as vscode from 'vscode';

const documentText = [
  'function outer() {',
  '  const one = 1;',
  '  const two = 2;',
  '',
  '  if (one) {',
  '    return two;',
  '  }',
  '}',
  'function after() {',
  '}'
].join('\n');

async function openTestEditor(line: number, character: number): Promise<vscode.TextEditor> {
  const document = await vscode.workspace.openTextDocument({
    content: documentText,
    language: 'typescript'
  });
  const editor = await vscode.window.showTextDocument(document);
  const position = new vscode.Position(line, character);
  editor.selection = new vscode.Selection(position, position);
  return editor;
}

async function execute(command: string): Promise<vscode.TextEditor> {
  await vscode.commands.executeCommand(command);
  const editor = vscode.window.activeTextEditor;
  assert.ok(editor);
  return editor;
}

suite('Indentation Level Movement', () => {
  test('moves down within the current indentation block', async () => {
    await openTestEditor(1, 4);

    const editor = await execute('indentation-level-movement.moveDown');

    assert.strictEqual(editor.selection.active.line, 2);
    assert.strictEqual(editor.selection.active.character, 4);
    assert.strictEqual(editor.selection.isEmpty, true);
  });

  test('moves down to the next matching indentation block', async () => {
    await openTestEditor(2, 4);

    const editor = await execute('indentation-level-movement.moveDown');

    assert.strictEqual(editor.selection.active.line, 4);
    assert.strictEqual(editor.selection.active.character, 4);
  });

  test('moves up to the previous matching indentation block', async () => {
    await openTestEditor(4, 4);

    const editor = await execute('indentation-level-movement.moveUp');

    assert.strictEqual(editor.selection.active.line, 2);
    assert.strictEqual(editor.selection.active.character, 4);
  });

  test('moves right to the first non-whitespace character', async () => {
    await openTestEditor(5, 0);

    const editor = await execute('indentation-level-movement.moveRight');

    assert.strictEqual(editor.selection.active.line, 5);
    assert.strictEqual(editor.selection.active.character, 4);
  });

  test('moves out to the parent indentation level above', async () => {
    await openTestEditor(5, 4);

    const editor = await execute('indentation-level-movement.moveOut');

    assert.strictEqual(editor.selection.active.line, 4);
    assert.strictEqual(editor.selection.active.character, 4);
    assert.strictEqual(editor.selection.isEmpty, true);
  });

  test('moves out preserving the current character position', async () => {
    await openTestEditor(5, 11);

    const editor = await execute('indentation-level-movement.moveOut');

    assert.strictEqual(editor.selection.active.line, 4);
    assert.strictEqual(editor.selection.active.character, 11);
  });

  test('keeps the cursor in place when no parent indentation exists', async () => {
    await openTestEditor(8, 3);

    const editor = await execute('indentation-level-movement.moveOut');

    assert.strictEqual(editor.selection.active.line, 8);
    assert.strictEqual(editor.selection.active.character, 3);
  });

  test('selects down from the original anchor to the moved position', async () => {
    await openTestEditor(1, 4);

    const editor = await execute('indentation-level-movement.selectDown');

    assert.strictEqual(editor.selection.anchor.line, 1);
    assert.strictEqual(editor.selection.anchor.character, 4);
    assert.strictEqual(editor.selection.active.line, 2);
    assert.strictEqual(editor.selection.active.character, 4);
    assert.strictEqual(editor.selection.isEmpty, false);
  });

  test('selects up from the original anchor to the moved position', async () => {
    await openTestEditor(4, 4);

    const editor = await execute('indentation-level-movement.selectUp');

    assert.strictEqual(editor.selection.anchor.line, 4);
    assert.strictEqual(editor.selection.anchor.character, 4);
    assert.strictEqual(editor.selection.active.line, 2);
    assert.strictEqual(editor.selection.active.character, 4);
    assert.strictEqual(editor.selection.isEmpty, false);
  });
});

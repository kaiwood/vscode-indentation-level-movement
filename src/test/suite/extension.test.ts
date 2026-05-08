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

  test('moves right with default behavior at the first non-whitespace character', async () => {
    await openTestEditor(5, 4);

    const editor = await execute('indentation-level-movement.moveRight');

    assert.strictEqual(editor.selection.active.line, 5);
    assert.strictEqual(editor.selection.active.character, 10);
  });

  test('moves multiple cursors right to each first non-whitespace character', async () => {
    const editor = await openTestEditor(1, 0);
    const firstPosition = new vscode.Position(1, 0);
    const secondPosition = new vscode.Position(5, 0);
    editor.selections = [
      new vscode.Selection(firstPosition, firstPosition),
      new vscode.Selection(secondPosition, secondPosition)
    ];

    await execute('indentation-level-movement.moveRight');

    assert.strictEqual(editor.selections.length, 2);
    assert.strictEqual(editor.selections[0].active.line, 1);
    assert.strictEqual(editor.selections[0].active.character, 2);
    assert.strictEqual(editor.selections[0].isEmpty, true);
    assert.strictEqual(editor.selections[1].active.line, 5);
    assert.strictEqual(editor.selections[1].active.character, 4);
    assert.strictEqual(editor.selections[1].isEmpty, true);
  });

  test('moves mixed cursors right with indentation and default behavior', async () => {
    const editor = await openTestEditor(1, 0);
    const firstPosition = new vscode.Position(1, 0);
    const secondPosition = new vscode.Position(5, 4);
    editor.selections = [
      new vscode.Selection(firstPosition, firstPosition),
      new vscode.Selection(secondPosition, secondPosition)
    ];

    await execute('indentation-level-movement.moveRight');

    assert.strictEqual(editor.selections.length, 2);
    assert.strictEqual(editor.selections[0].active.line, 1);
    assert.strictEqual(editor.selections[0].active.character, 2);
    assert.strictEqual(editor.selections[0].isEmpty, true);
    assert.strictEqual(editor.selections[1].active.line, 5);
    assert.strictEqual(editor.selections[1].active.character, 10);
    assert.strictEqual(editor.selections[1].isEmpty, true);
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

  test('selects right to the first non-whitespace character', async () => {
    await openTestEditor(5, 0);

    const editor = await execute('indentation-level-movement.selectRight');

    assert.strictEqual(editor.selection.anchor.line, 5);
    assert.strictEqual(editor.selection.anchor.character, 0);
    assert.strictEqual(editor.selection.active.line, 5);
    assert.strictEqual(editor.selection.active.character, 4);
    assert.strictEqual(editor.selection.isEmpty, false);
  });

  test('selects right with default behavior at the first non-whitespace character', async () => {
    await openTestEditor(5, 4);

    const editor = await execute('indentation-level-movement.selectRight');

    assert.strictEqual(editor.selection.anchor.line, 5);
    assert.strictEqual(editor.selection.anchor.character, 4);
    assert.strictEqual(editor.selection.active.line, 5);
    assert.strictEqual(editor.selection.active.character, 10);
    assert.strictEqual(editor.selection.isEmpty, false);
  });

  test('selects multiple cursors right to each first non-whitespace character', async () => {
    const editor = await openTestEditor(1, 0);
    const firstPosition = new vscode.Position(1, 0);
    const secondPosition = new vscode.Position(5, 0);
    editor.selections = [
      new vscode.Selection(firstPosition, firstPosition),
      new vscode.Selection(secondPosition, secondPosition)
    ];

    await execute('indentation-level-movement.selectRight');

    assert.strictEqual(editor.selections.length, 2);
    assert.strictEqual(editor.selections[0].anchor.line, 1);
    assert.strictEqual(editor.selections[0].anchor.character, 0);
    assert.strictEqual(editor.selections[0].active.line, 1);
    assert.strictEqual(editor.selections[0].active.character, 2);
    assert.strictEqual(editor.selections[0].isEmpty, false);
    assert.strictEqual(editor.selections[1].anchor.line, 5);
    assert.strictEqual(editor.selections[1].anchor.character, 0);
    assert.strictEqual(editor.selections[1].active.line, 5);
    assert.strictEqual(editor.selections[1].active.character, 4);
    assert.strictEqual(editor.selections[1].isEmpty, false);
  });
});

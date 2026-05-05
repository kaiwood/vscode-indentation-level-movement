'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';
import { window, commands, ExtensionContext, Position, Range, Selection, TextEditor } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const moveDown = commands.registerCommand('indentation-level-movement.moveDown', () => {
    const editor = window.activeTextEditor;
    if (editor) {
      new IndentationLevelMover(editor).moveDown();
    }
  });

  const moveUp = commands.registerCommand('indentation-level-movement.moveUp', () => {
    const editor = window.activeTextEditor;
    if (editor) {
      new IndentationLevelMover(editor).moveUp();
    }
  });

  const moveRight = commands.registerCommand('indentation-level-movement.moveRight', () => {
    const editor = window.activeTextEditor;
    if (editor) {
      new IndentationLevelMover(editor).moveRight();
    }
  });

  const selectDown = commands.registerCommand('indentation-level-movement.selectDown', () => {
    const editor = window.activeTextEditor;
    if (editor) {
      new IndentationLevelMover(editor).selectDown();
    }
  });

  const selectUp = commands.registerCommand('indentation-level-movement.selectUp', () => {
    const editor = window.activeTextEditor;
    if (editor) {
      new IndentationLevelMover(editor).selectUp();
    }
  });

  context.subscriptions.push(moveDown);
  context.subscriptions.push(moveUp);
  context.subscriptions.push(moveRight);
  context.subscriptions.push(selectDown);
  context.subscriptions.push(selectUp);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class IndentationLevelMover {
  editor: TextEditor;

  constructor(editor: TextEditor) {
    this.editor = editor;
  }

  public moveUp() {
    let currentLineNumber = this.editor.selection.active.line;
    let currentLevel = this.indentationLevelForLine(currentLineNumber);
    let nextLine = this.findPreviousLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveDown() {
    let currentLineNumber = this.editor.selection.active.line;
    let currentLevel = this.indentationLevelForLine(currentLineNumber);
    let nextLine = this.findNextLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveRight() {
    let currentPosition = this.editor.selection.active.character;
    let indentationPosition = this.indentationLevelForLine(this.editor.selection.start.line);

    if (currentPosition < indentationPosition) {
      if (this.editor.selections.length > 1) {
        commands.executeCommand('cursorWordEndRight').then(() => {
          commands.executeCommand('cursorWordStartLeft');
        });
      } else {
        let position = new Position(this.editor.selection.active.line, indentationPosition);
        this.editor.selection = new Selection(position, position);
      }
    } else {
      commands.executeCommand('cursorWordEndRight');
    }
  }

  public selectUp() {
    let startPoint = this.editor.selection.anchor;
    this.moveUp();
    let endPoint = this.editor.selection.active;
    this.editor.selection = new Selection(startPoint, endPoint);
  }

  public selectDown() {
    let startPoint = this.editor.selection.anchor;
    this.moveDown();
    let endPoint = this.editor.selection.active;
    this.editor.selection = new Selection(startPoint, endPoint);
  }

  private move(toLine: number) {
    let currentCharacter = this.editor.selection.anchor.character;
    let position = this.editor.selection.active;
    let newPosition = position.with(toLine, currentCharacter);
    let selection = new Selection(newPosition, newPosition);

    this.editor.selection = selection;
    this.editor.revealRange(new Range(newPosition, newPosition));
  }

  private indentationLevelForLine(lineToCheck: number) {
    const line = this.editor.document.lineAt(lineToCheck);
    return line.firstNonWhitespaceCharacterIndex;
  }

  private emptyLine(lineNumber: number) {
    const line = this.editor.document.lineAt(lineNumber);
    return line.isEmptyOrWhitespace;
  }

  private findNextLine(currentLineNumber: number, currentIndentationLevel: number) {
    const endLineNumber = this.editor.document.lineCount - 1;
    if (currentLineNumber === endLineNumber) {
      return;
    }
    const nextLineNumber = currentLineNumber + 1;
    const jumpingOverSpace =
      this.indentationLevelForLine(nextLineNumber) !== currentIndentationLevel ||
      this.emptyLine(nextLineNumber);

    for (let lineNumber = nextLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      let indentationForLine = this.indentationLevelForLine(lineNumber);

      if (
        jumpingOverSpace &&
        indentationForLine === currentIndentationLevel &&
        !this.emptyLine(lineNumber)
      ) {
        return lineNumber;
      } else if (
        !jumpingOverSpace &&
        (indentationForLine !== currentIndentationLevel || this.emptyLine(lineNumber))
      ) {
        return lineNumber - 1;
      } else if (
        !jumpingOverSpace &&
        indentationForLine === currentIndentationLevel &&
        lineNumber === endLineNumber
      ) {
        return lineNumber;
      }
    }

    return;
  }

  private findPreviousLine(currentLineNumber: number, currentIndentationLevel: number) {
    if (currentLineNumber === 0) {
      return;
    }

    const previousLineNumber = currentLineNumber - 1;
    const jumpingOverSpace =
      this.indentationLevelForLine(previousLineNumber) !== currentIndentationLevel ||
      this.emptyLine(previousLineNumber);

    for (let lineNumber = previousLineNumber; lineNumber >= 0; lineNumber--) {
      let indentationForLine = this.indentationLevelForLine(lineNumber);

      if (
        jumpingOverSpace &&
        indentationForLine === currentIndentationLevel &&
        !this.emptyLine(lineNumber)
      ) {
        return lineNumber;
      } else if (
        !jumpingOverSpace &&
        (indentationForLine !== currentIndentationLevel || this.emptyLine(lineNumber))
      ) {
        return lineNumber + 1;
      } else if (
        !jumpingOverSpace &&
        indentationForLine === currentIndentationLevel &&
        lineNumber === 0
      ) {
        return lineNumber;
      }
    }

    return;
  }

  dispose() {}
}

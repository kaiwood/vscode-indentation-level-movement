"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';
import {
  window,
  commands,
  ExtensionContext,
  Position,
  Range,
  Selection
} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  let indentationLevelMover = new IndentationLevelMover();

  var moveDown = commands.registerCommand(
    "indentation-level-movement.moveDown",
    () => {
      indentationLevelMover.moveDown();
    }
  );

  var moveUp = commands.registerCommand(
    "indentation-level-movement.moveUp",
    () => {
      indentationLevelMover.moveUp();
    }
  );

  var moveRight = commands.registerCommand(
    "indentation-level-movement.moveRight",
    () => {
      indentationLevelMover.moveRight();
    }
  );

  var selectDown = commands.registerCommand(
    "indentation-level-movement.selectDown",
    () => {
      indentationLevelMover.selectDown();
    }
  );

  var selectUp = commands.registerCommand(
    "indentation-level-movement.selectUp",
    () => {
      indentationLevelMover.selectUp();
    }
  );

  context.subscriptions.push(indentationLevelMover);
  context.subscriptions.push(moveDown);
  context.subscriptions.push(moveUp);
  context.subscriptions.push(moveRight);
  context.subscriptions.push(selectDown);
  context.subscriptions.push(selectUp);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class IndentationLevelMover {
  public moveUp() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let currentLineNumber = editor.selection.start.line;
    let currentLevel = this.indentationLevelForLine(currentLineNumber);
    let nextLine = this.findPreviousLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveDown() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let currentLineNumber = editor.selection.start.line;
    let currentLevel = this.indentationLevelForLine(currentLineNumber);
    let nextLine = this.findNextLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveRight() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let currentPosition = editor.selection.active.character;
    let indentationPosition = this.indentationLevelForLine(
      editor.selection.start.line
    );

    if (currentPosition < indentationPosition) {
      if (editor.selections.length > 1) {
        commands.executeCommand("cursorWordEndRight").then(() => {
          commands.executeCommand("cursorWordStartLeft");
        });
      } else {
        let position = new Position(
          editor.selection.active.line,
          indentationPosition
        );
        editor.selection = new Selection(position, position);
      }
    } else {
      commands.executeCommand("cursorWordEndRight");
    }
  }

  public selectUp() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    let startPoint = editor.selection.start;
    this.moveUp();
    let endPoint = editor.selection.end;
    editor.selection = new Selection(startPoint, endPoint);
  }

  public selectDown() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let startPoint = editor.selection.start;
    this.moveDown();
    let endPoint = editor.selection.end;
    editor.selection = new Selection(startPoint, endPoint);
  }

  public move(toLine) {
    let editor = window.activeTextEditor;

    let currentCharacter = editor.selection.start.character;
    let position = editor.selection.active;
    let newPosition = position.with(toLine, currentCharacter);
    let selection = new Selection(newPosition, newPosition);

    editor.selection = selection;
    editor.revealRange(new Range(newPosition, newPosition));
  }

  public indentationLevelForLine(lineToCheck) {
    let editor = window.activeTextEditor;
    let line = editor.document.lineAt(lineToCheck);

    // TODO: check for whitespace-only lines as well
    if (line.text.toString().length === 0) {
      return -1;
    } else {
      return line.firstNonWhitespaceCharacterIndex;
    }
  }

  public findNextLine(currentLineNumber, currentIndentationLevel: Number) {
    let editor = window.activeTextEditor;

    if (currentLineNumber === editor.document.lineCount - 1) {
      return;
    }

    var gap =
      this.indentationLevelForLine(currentLineNumber + 1) !==
      currentIndentationLevel
        ? true
        : false;

    for (
      let lineNumber = currentLineNumber + 1;
      lineNumber < editor.document.lineCount;
      lineNumber++
    ) {
      let indentationForLine = this.indentationLevelForLine(lineNumber);

      if (gap && indentationForLine === currentIndentationLevel) {
        return lineNumber;
      } else if (!gap && indentationForLine !== currentIndentationLevel) {
        return lineNumber - 1;
      }
    }

    return editor.document.lineCount - 1;
  }

  public findPreviousLine(currentLineNumber, currentIndentationLevel: Number) {
    let editor = window.activeTextEditor;

    if (currentLineNumber === 0) {
      return;
    }

    var gap =
      this.indentationLevelForLine(currentLineNumber - 1) !==
      currentIndentationLevel
        ? true
        : false;

    for (let lineNumber = currentLineNumber - 1; lineNumber > 0; lineNumber--) {
      let indentationForLine = this.indentationLevelForLine(lineNumber);

      if (gap && indentationForLine === currentIndentationLevel) {
        return lineNumber;
      } else if (!gap && indentationForLine !== currentIndentationLevel) {
        return lineNumber + 1;
      }
    }

    return 0;
  }

  dispose() {}
}

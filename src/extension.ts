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
  Selection,
  TextEditor
} from "vscode";
import { isNumber } from "util";

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

  var moveOut = commands.registerCommand(
    "indentation-level-movement.moveOut",
    () => {
      indentationLevelMover.moveOut();
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
  context.subscriptions.push(moveOut);
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

    let currentLineNumber: number | undefined = editor.selection.start.line;
    if (currentLineNumber === undefined) { return; }
    let currentLevel: number = this.indentationLevelForLine(currentLineNumber);
    let nextLine: number = this.findPreviousLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveOut() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let currentLineNumber: number | undefined = editor.selection.start.line;
    if (currentLineNumber === undefined) { return; }
    let currentLevel: number = this.indentationLevelForLine(currentLineNumber);
    let nextLine: number = this.findParentLine(currentLineNumber, currentLevel);

    this.move(nextLine);
  }

  public moveDown() {
    let editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let currentLineNumber = editor.selection.start.line;
    let currentLevel = this.indentationLevelForLine(currentLineNumber);
    let nextLine: number = this.findNextLine(currentLineNumber, currentLevel);

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

  public move(toLine: number) {
    let editor: TextEditor | undefined = window.activeTextEditor;
    if (editor === undefined) {
      return;
    }
    let currentCharacter = editor.selection.start.character;
    let position = editor.selection.active;
    let newPosition = position.with(toLine, currentCharacter);
    let selection = new Selection(newPosition, newPosition);

    editor.selection = selection;
    editor.revealRange(new Range(newPosition, newPosition));
  }

  public indentationLevelForLine(lineToCheck: number): number {
    let editor: TextEditor | undefined = window.activeTextEditor;
    if (editor === undefined) {
      return -1;
    }
    let line = editor.document.lineAt(lineToCheck);
    let tabSize: number | undefined = isNumber(editor.options.tabSize) ? editor.options.tabSize : 4;

    if (line.isEmptyOrWhitespace || line.text.startsWith("//", line.firstNonWhitespaceCharacterIndex)) {
      return -1;
    } else {
      let whiteSpaceEnd: number = line.firstNonWhitespaceCharacterIndex;
      let col: number = 0;
      for (let charIndex: number = 0; charIndex < whiteSpaceEnd; charIndex++) {
        if (line.text.charAt(charIndex) === '\t') {
          col = (Math.floor(col / tabSize) + 1) * tabSize;
        } else {
          col++;
        }
      }
      return col;
    }
  }

  public findNextLine(currentLineNumber: number, currentIndentationLevel: number): number {
    let editor: TextEditor | undefined = window.activeTextEditor;
    if (editor === undefined) {
      return 0;
    }

    if (currentLineNumber === editor.document.lineCount - 1) {
      return 0;
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

  public findPreviousLine(currentLineNumber: number, currentIndentationLevel: number): number {
    if (currentLineNumber === 0) {
      return 0;
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

  public findParentLine(currentLineNumber: number, currentIndentationLevel: number): number {
    if (currentLineNumber === 0) {
      return 0;
    }

    for (let lineNumber = currentLineNumber - 1; lineNumber > 0; lineNumber--) {
      let indentationForLine = this.indentationLevelForLine(lineNumber);

      if (indentationForLine >= 0 && indentationForLine < currentIndentationLevel) {
        return lineNumber;
      }
    }

    return 0;
  }

  dispose() {}
}

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';
import {
    window,
    commands,
    Disposable,
    ExtensionContext,
    StatusBarAlignment,
    StatusBarItem,
    TextDocument,
    Position,
    Range,
    Selection,
} from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    let indentationLevelMover = new IndentationLevelMover();

    var moveDown = commands.registerCommand('indentation-level-movement.moveDown', () => {
        indentationLevelMover.moveDown();
    });

    var moveUp = commands.registerCommand('indentation-level-movement.moveUp', () => {
        indentationLevelMover.moveUp();
    })

    context.subscriptions.push(indentationLevelMover);
    context.subscriptions.push(moveDown);
    context.subscriptions.push(moveUp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}


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

    public move(toLine) {
        let editor = window.activeTextEditor;

        let currentLineNumber = editor.selection.start.line;
        let currentCharacter = editor.selection.start.character;
        let position = editor.selection.active;
        let newPosition = position.with(toLine, currentCharacter);
        let selection = new Selection(newPosition, newPosition);

        editor.selection = selection;
    }

    public indentationLevelForLine(lineToCheck) {
        let editor = window.activeTextEditor;
        let line = editor.document.lineAt(lineToCheck);

        if (line.text.toString().length === 0) { // TODO check for whitespace-only lines as well
            return -1;
        } else {
            return line.firstNonWhitespaceCharacterIndex;
        }
    }

    public findNextLine(currentLineNumber, currentIndentationLevel: Number) {
        let editor = window.activeTextEditor;

        var gap = (this.indentationLevelForLine(currentLineNumber+1) !== currentIndentationLevel ? true : false)

        for (let lineNumber = currentLineNumber + 1; lineNumber < editor.document.lineCount; lineNumber++) {
            let indentationForLine = this.indentationLevelForLine(lineNumber);

            if (gap && indentationForLine === currentIndentationLevel) {
                return lineNumber;
            } else if ((!gap) && indentationForLine !== currentIndentationLevel) {
                return lineNumber - 1;
            }
        }

        return editor.document.lineCount - 1;
    }

    public findPreviousLine(currentLineNumber, currentIndentationLevel: Number) {
        let editor = window.activeTextEditor;
        var gap = (this.indentationLevelForLine(currentLineNumber-1) !== currentIndentationLevel ? true : false)

        for (let lineNumber = currentLineNumber - 1; lineNumber > 0; lineNumber--) {
            let indentationForLine = this.indentationLevelForLine(lineNumber);

            if (gap && indentationForLine === currentIndentationLevel) {
                return lineNumber;
            } else if ((!gap) && indentationForLine !== currentIndentationLevel) {
                return lineNumber + 1;
            }
        }

        return 0;
    }

    dispose() {
    }
}
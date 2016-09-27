'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let moveDown = vscode.commands.registerCommand('extension.moveDown', () => {
        moveDownUntilCharClassChanges();
    });

    let moveUp = vscode.commands.registerCommand('extension.moveUp', () => {
        moveUpUntilCharClassChanges();
    });

    context.subscriptions.push(moveDown);
    context.subscriptions.push(moveUp);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function charBeforeCursor() {
    let selection = vscode.window.activeTextEditor.selection;

    let endPosition = new vscode.Position(selection.end.line, selection.end.character + 1);
    let range = new vscode.Range(selection.start, endPosition);

    let char = vscode.window.activeTextEditor.document.getText(range)
    return char;
}

function nextCharBeforeCursor() {
    let selection = vscode.window.activeTextEditor.selection;

    let startPosition = new vscode.Position(selection.start.line + 1, selection.start.character);
    let endPosition = new vscode.Position(selection.end.line + 1, selection.end.character + 1);
    let range = new vscode.Range(startPosition, endPosition);

    let char = vscode.window.activeTextEditor.document.getText(range)
    return char;
}

function previousCharBeforeCursor() {
    let selection = vscode.window.activeTextEditor.selection;

    let startPosition = new vscode.Position(selection.start.line - 1, selection.start.character);
    let endPosition = new vscode.Position(selection.end.line - 1, selection.end.character + 1);
    let range = new vscode.Range(startPosition, endPosition);

    let char = vscode.window.activeTextEditor.document.getText(range)
    return char;
}

function isWhitespace(char) {
    return char.search(/\w/) >= 0 ? false : true
}

function moveDownUntilCharClassChanges() {
    if (isWhitespace(charBeforeCursor()) && isWhitespace(nextCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorDown").then(function () {
            moveDownUntilCharClassChanges();
        });

    } else if (!isWhitespace(charBeforeCursor()) && !isWhitespace(nextCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorDown").then(function () {
            moveDownUntilCharClassChanges();
        });

    } else if (!isWhitespace(charBeforeCursor()) && isWhitespace(nextCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorDown").then(function () {
            moveDownUntilCharClassChanges();
        });

    } else if (isWhitespace(charBeforeCursor()) && !isWhitespace(nextCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorDown")

    }
}

function moveUpUntilCharClassChanges() {
    if (isWhitespace(charBeforeCursor()) && isWhitespace(previousCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorUp").then(function () {
            moveUpUntilCharClassChanges();
        });

    } else if (!isWhitespace(charBeforeCursor()) && !isWhitespace(previousCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorUp").then(function () {
            moveUpUntilCharClassChanges();
        });

    } else if (isWhitespace(charBeforeCursor()) && !isWhitespace(previousCharBeforeCursor())) {

        vscode.commands.executeCommand("cursorUp")

    }
}

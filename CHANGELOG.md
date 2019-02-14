# Release Notes

## 1.3.0

Add Indentation Level Move Out command to jump to parent line above with Alt-[.
Update extension API version/code.

## 1.2.0

When determining the indentation level, ignore lines containing only whitespace (#2)

## 1.1.1

Bugfix: Handle multiple cursors correctly when moving to the right

## 1.1.0

Introduce moveRight command: If the cursor is somewhere left of the indentation level of the current line, moving wordwise (alt+right / ctrl+right) now stops at the indentation level,
not at the end of the first word.

## 1.0.2

Bugfix: Extension didn't activate when using the selection commands.

## 1.0.0

The missing piece: Selections!

## 0.3.0

Scroll to cursor if it moves out of the viewport

## 0.2.0

Use more precise algorithm to handle nested intentations

## 0.1.0

Initial release

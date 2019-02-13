# Indentation Level Movement

Provides commands and keyboard shortcuts to jump the cursor with or without selection vertically based on indentation levels.

## Features

* Default shortcuts are `alt+up` / `alt+down` on macOS and `ctrl+up` / `ctrl+down` on Windows and Linux, holding the shift key adds the selection.
* Additional shortcut `alt+[` can be used to navigate out one level of indentation (to the above parent row for the current block).

What is this good for, you ask? With this extension, you can quickly zip through your source code, jump from method to method or select whole blocks of text with one key press:

![Indentation Level Movement](images/indentation-level-movement.gif)

## Extension Settings

None at this time.

## Known Issues

* There is currently no means of controlling how comments are skipped. The extension assumes comment lines are always marked only with `//` after the first whitespace of the line.

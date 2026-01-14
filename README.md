# FASM extension for VSCode

<img src="https://i.ibb.co/dP2KRZs/fasm.png" width="50">

![Static Badge](https://img.shields.io/badge/Node_Js-20.18.0-2354cc)
![Static Badge](https://img.shields.io/badge/npm-10.8.2-707d9c)

A powerful <a href="https://code.visualstudio.com/">VSCode</a> extension for convenient development in <a href="https://flatassembler.net/">FlatASM</a>, featuring advanced syntax highlighting and integrated build/debug tools.

## Features

### 📝 Syntax Highlighting
Comprehensive code highlighting for FASM assembly language:
- **Instructions**: `mov`, `add`, `sub`, `jmp`, `call`, etc.
- **Registers**: `eax`, `ebx`, `edi`, `rax`, `rbx`, etc.
- **Strings**: Single and double quoted strings (`'str'`, `"str"`)
- **Numbers**: Hexadecimal (`0x123`), binary (`010101b`), decimal
- **Data Types**: `db`, `dd`, `dw`, `dq`, and other FASM directives

<img src="https://i.ibb.co/4Vtwz9z/highlight.png" width="400">

### 🔨 Build & Execution

The extension provides integrated build, run, and debug capabilities with intelligent project configuration:

| Command | Shortcut (Windows/Linux) | Shortcut (macOS) | Description |
|---------|--------------------------|------------------|-------------|
| **Build & Run** | `F5` | `F5` | Compile FASM code and generate executable |
| **Run Executable** | `F9` | `F9` | Execute the compiled `.exe` file |
| **Debug** | `Ctrl + F5` | `Cmd + F5` | Launch debugger with the compiled executable |

### ⚙️ Project Configuration

Before using build/run/debug features, initialize your project:

1. Open a `.asm` file in VSCode
2. Run **FASM: Create Build Configuration** command
3. Provide the path to your debugger (e.g., `Olly Dbg`)
4. Extension generates `.vscode/tasks.json` with build settings
5. Modify `tasks.json` to customize:
   - FASM assembler path
   - Output executable name and location
   - Include file paths

### 📋 Code Completion

IntelliSense-style code completion for FASM instructions, registers, and directives helps you write code faster and with fewer errors.

### 🐛 Debugger Integration

Integrated support for <a href="https://www.ollydbg.de/">OllyDbg</a> debugger:
- Automatically launch debugger with compiled executables
- Debug the currently active assembly file
- Seamless workflow from editing to debugging

## Requirements

- **VSCode**: v1.96.0 or higher
- **FASM**: Latest version installed and configured
- **Debugger**: OllyDbg (for debug features)

## Configuration

The extension automatically creates configuration files in `.vscode/tasks.json`:
- Adjust FASM assembler path
- Set output executable path
- Configure include directories

Edit `tasks.json` to match your project setup.

## Keyboard Shortcuts

- **F5**: Compile and build project
- **F9**: Run compiled executable
- **Ctrl+F5** / **Cmd+F5**: Launch debugger

## Usage Tips

- The active FASM file when creating config becomes the default compile target (configurable in `tasks.json`)
- Output `.exe` file path can be customized in configuration
- Use code completion for faster development
- IntelliSense highlights syntax errors in real-time

## Repository

<a href="https://github.com/kostyabet/VSCode-FASM-ext">View on GitHub</a>

## License

<a href="https://github.com/kostyabet/VSCode-FASM-ext/blob/release/LICENSE.txt">MIT License</a>

## Support

If you find this extension helpful, please ⭐ star the <a href="https://github.com/kostyabet/VSCode-FASM-ext">GitHub repository</a>!
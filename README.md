# FASM ext - FlatASM language extension

<img src="https://i.ibb.co/dP2KRZs/fasm.png" width="50">

![Static Badge](https://img.shields.io/badge/Node_Js-20.18.0-2354cc)
![Static Badge](https://img.shields.io/badge/npm-10.8.2-707d9c)

<h3>Extension for <a href="https://code.visualstudio.com/">VSCode</a> for more convenient programming on <a href="https://flatassembler.net/">FlatASM</a>.</h3>

## Features
- _`Code highlighting`_:</br>
    - Extension highlight `fasm`: </br>
        - macros `proc`;
        - instractions (`mov`, `add`, `sub`, ...);
        - registers (`eax`, `ebx`, `edi`, ...);
        - strings (`'str'`, `"str"`, ...);
        - numbers (`0x123`, `010101b`, ...);
        - types of data (`db`, `dd`, `dw`, ...). </br> </br>
    <img src="https://i.ibb.co/4Vtwz9z/highlight.png" width="400"></br></br>
- _`Build & Run` / `Debug`_:
    - __`Build and Run`__: </br>
        - Build and run programm.</br>
          Has been running by using `F5` or press on the button <img src="https://i.ibb.co/YFL4Mtsk/photo-2025-01-31-10-37-36.jpg" width="20">.</br>
          Compiling file it is file which be active at the moment when configuration file creates.</br>
          `*.exe` file created on compiling file. This file can be changed in `tasks.json`.</br>
    - __`Debug`__: </br>
        - Run <a href="https://www.ollydbg.de/">`Olly Dbg`</a> by use active `*.exe` file.</br>
          Has been running by using `Ctrl + F5`.</br>

## Setup
Setup your config in file `settings.json` & `task.json` in folder `.vscode`:
### For assembler
In file `settings.json`:
```json
{
    "fasm.assemblerPath": "c:\\Users\\divmone\\Documents\\dev\\VSCode-FASM-ext\\bin\\fasm",
    "fasm.includePath": "c:\\Users\\divmone\\Documents\\dev\\VSCode-FASM-ext\\bin\\fasm\\include"
}
```
> `assemblerPath` - path to the `fasm` folder</br>
> `includePath` - path to the `include` folder in fasm compiller
### For debugger
In file `task.json`:
```json
{
    ...
    "activeFilePath": "c:\\Users\\divmone\\Downloads\\fasm\\EXAMPLES\\HELLO\\HELLO.ASM",
    "executionFilePath": "c:\\Users\\divmone\\Downloads\\fasm\\EXAMPLES\\HELLO\\HELLO.exe",
    "debuggerFilePath": ""
}
```
> `activeFilePath` - path to the main file from which compiler start building</br>
> `executionFilePath` - path where you want to store `*.exe` file</br>
> `debuggerFilePath` - path to the `olly.dbg`

## Source code
<a href="https://github.com/kostyabet/VSCode-FASM-ext">GitHub repo</a>

## License
<a href="https://github.com/kostyabet/VSCode-FASM-ext/blob/release/LICENSE.txt">MIT</a>

## Support
Press star on our <a href="https://github.com/kostyabet/VSCode-FASM-ext">GitHub repo</a> please!
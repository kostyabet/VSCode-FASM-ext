# Change Log

All notable changes to the **FASM extension** for Visual Studio Code are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] — 2026-07-06

### Added
- New optional `fasm.additionalOutputExtension` setting. When set (e.g. `"bin"`), the build produces a second output file with that extension alongside the primary `*.exe`, enabling workflows such as booting `format binary` sources in emulators like QEMU without manual renaming ([#22](https://github.com/kostyabet/VSCode-FASM-ext/issues/22)).

### Changed
- `Build FASM` task in `tasks.json` chains a platform-appropriate copy step (`copy /Y` on Windows, `cp -f` elsewhere) after `fasm` when the additional output extension is configured.

## [0.5.1] — 2026-07-06

### Added
- Syntax highlighting for octal literals with the `o` / `q` suffix (e.g. `20o`).
- Support for digit separators (`_`, `'`, `#`) inside numeric literals across all bases — hex, binary, octal, and decimal (e.g. `123_456_789`, `0xffff_ffff`, `0101'0101b`, `10#20#40o`).
- Syntax highlighting for single-quoted string literals (`'string'`), matching the existing double-quoted behavior including escape sequences.

## [0.5.0] — 2026-02-22

### Added
- New `fasm.assemblerPath` and `fasm.includePath` settings under the **FASM** configuration section for pointing at an existing FASM installation and include directory.

### Changed
- Refactored `helper.ts` and streamlined `commands.ts`.
- Updated launch configuration.

## [0.4.0] — 2026-01-14

### Added
- Optional debugger installation and FASM setup step in the configuration wizard.
- Autocompletion for `proc` macros.

### Changed
- Updated README with new macro example imagery and refreshed properties documentation.

### Fixed
- `package.json` dev-dependency cleanup.

## [0.3.0] — 2025-02-02

### Added
- Automatic FASM downloader and setup flow.
- Dedicated **Run Exe** command (`fasm.run`) that executes the produced binary, plus an editor-title run button.
- Modularized internals: separate units for commands, debug command, helpers, and regular expressions.

### Changed
- Refined completion structure and code style.

### Removed
- Bundled `ollydbg` folder (debugger is now handled through the setup wizard).

### Fixed
- Debug command reliability and path handling for the debugger.
- License file.

## [0.2.1] — 2025-01-31

### Fixed
- Packaging fix so all required files ship with the extension.

## [0.2.0] — 2025-01-31

### Added
- Run and debug commands with default keyboard shortcuts (`F5` build, `Ctrl+F5` / `Cmd+F5` debug, `F9` run exe).
- Debugger launch integration.
- Run/Debug buttons in the editor title bar.
- Autocompletion for macros, registers, and instructions.

### Changed
- Introduced a module system and improved overall code structure.

## [0.1.0] — 2025-01-26

### Added
- Syntax highlighting for FASM instructions, macros, and registers.
- Label highlighting.

### Fixed
- Miscellaneous syntax highlighting corrections.
- Icon path.

## [0.0.5] — 2025-01-19

### Added
- Extension logo.

### Fixed
- Cleanup of unused workflow (`*.yml`) sections.

## [0.0.4] — 2025-01-19

### Added
- README.

### Fixed
- FASM logo URL and source path.
- Project name.

## [0.0.3] — 2025-01-19

### Added
- GitHub release workflow.

### Fixed
- `name` field for release.

## [0.0.2] — 2025-01-19

### Fixed
- `repository` field and license metadata.

## [0.0.1] — 2025-01-19

### Added
- Initial release of the FASM language extension.
- Language definition and grammar scaffolding for Flat Assembler (`.asm`, `.ASM`, `.inc`, `.INC`).
- Theme entries for control-flow highlight color.
- Baseline JSON descriptor for the `abs` identifier.
- Publishing workflow.

[0.5.1]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.0.5...v0.1.0
[0.0.5]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/kostyabet/VSCode-FASM-ext/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/kostyabet/VSCode-FASM-ext/releases/tag/v0.0.1

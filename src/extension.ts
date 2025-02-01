import * as vscode from 'vscode';
import completionProvider from "./completion"
import commands from "./commands"
import config from "./config"

export function activate(context: vscode.ExtensionContext) {
    // register buttons & provider
    const provider = completionProvider()
    
    // register commands
    const createConfigCommand = vscode.commands.registerCommand('fasm.createConfigs', async () => await commands.createConfigCommand());
    const showDropdownCommand = vscode.commands.registerCommand('fasm.showDropdown', async () => await commands.showDropdownCommand());
    const debugCommand = vscode.commands.registerCommand('fasm.debug', async () => await commands.debugCommand(context.extensionPath));
    const runCommand = vscode.commands.registerCommand('fasm.run', async () => await commands.runCommand());
    
    if (vscode.window.activeTextEditor?.document.languageId === 'fasm') {
        config.checkAndCreateConfigs();
    }

    context.subscriptions.push(provider, createConfigCommand, showDropdownCommand, debugCommand, runCommand);
}

export function deactivate() {}

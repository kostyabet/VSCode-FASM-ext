import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from "os";
import { execFile } from 'child_process';
const { exec } = require('child_process');

let currentMode: 'run' | 'debug' = 'run';

import completionProvider from "./completion"
import commandsRegister from "./commands"

export function activate(context: vscode.ExtensionContext) {
    const provider = completionProvider()
    
    // register commands
    const createConfigsCommand = vscode.commands.registerCommand('fasm.createConfigs', async () => await commandsRegister());

    if (vscode.window.activeTextEditor?.document.languageId === 'fasm') {
        checkAndCreateConfigs();
    }

    let showDropdownCommand = vscode.commands.registerCommand('fasm.showDropdown', async () => {
        const selected = await vscode.window.showQuickPick([
            {
                label: 'Run FASM',
                description: 'Run the current FASM file',
                command: 'fasm.run'
            },
            {
                label: 'Debug FASM',
                description: 'Debug the current FASM file',
                command: 'fasm.debug'
            }
        ]);

        if (selected) {
            if (selected.command === 'fasm.run') {
                currentMode = 'run';
                vscode.commands.executeCommand('setContext', 'fasm.mode.run', true);
                vscode.commands.executeCommand('setContext', 'fasm.mode.debug', false);
            } else if (selected.command === 'fasm.debug') {
                currentMode = 'debug';
                vscode.commands.executeCommand('setContext', 'fasm.mode.run', false);
                vscode.commands.executeCommand('setContext', 'fasm.mode.debug', true);
            }
        }
    });

    const debugCommand = vscode.commands.registerCommand('fasm.debug', async () => {
        vscode.window.showInformationMessage('Debugging FASM...');
        
        const programPath = path.join(context.extensionPath, 'bin/ollydbg', 'ollydbg.exe');
    if (!fs.existsSync(programPath)) {
        vscode.window.showErrorMessage(`OllyDbg not found at: ${programPath}`);
        return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return;

    const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
    if (!fs.existsSync(tasksPath)) {
        vscode.window.showErrorMessage('tasks.json не найден.');
        return;
    }

    const tasksConfig = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    const outputExecutable = tasksConfig.executionFilePath;

    execFile(programPath, [outputExecutable]);

      });

    const runCommand = vscode.commands.registerCommand('fasm.run', async () => {
        vscode.window.showInformationMessage('Running FASM...');
    
        if (!isWorkspaceConfigured()) {
            const choice = await vscode.window.showInformationMessage(
                'Workspace is not configured. Do you want to configure it now?',
                'Yes', 'No'
            );
    
            if (choice === 'Yes') {
                await vscode.commands.executeCommand('fasm.createConfigs');
            }
            return; 
        }
    
        try {
            const buildTask = (await vscode.tasks.fetchTasks()).find(task => task.name === 'Build FASM');
            if (!buildTask) {
                vscode.window.showErrorMessage('Build FASM task not found.');
                return;
            }
    
            const execution = await vscode.tasks.executeTask(buildTask);
            let buildSuccess = false;
    
            await new Promise<void>((resolve) => {
                const disposable = vscode.tasks.onDidEndTaskProcess(e => {
                    if (e.execution === execution) {
                        if (e.exitCode === 0) {
                            buildSuccess = true;
                        }
                        disposable.dispose();
                        resolve();
                    }
                });
            });
    
            if (!buildSuccess) {
                vscode.window.showErrorMessage('Build failed. Run aborted.');
                return;
            }
 
        } catch (error) {
            vscode.window.showErrorMessage(`Run failed: ${error}`);
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) return;
    
        const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
        const tasksConfig = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
        const outputExecutable =  tasksConfig.executionFilePath;
        
        exec(outputExecutable);

    });
    

    context.subscriptions.push(debugCommand, showDropdownCommand, runCommand, provider, createConfigsCommand);

}

async function checkAndCreateConfigs() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return;

    const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
    if (!fs.existsSync(tasksPath)) {
        const choice = await vscode.window.showInformationMessage(
            'Create FASM build configuration?',
            'Yes', 'No'
        );
        
        if (choice === 'Yes') {
            await vscode.commands.executeCommand('fasm.createConfigs');
        }
    }
}

export function deactivate() {
}

function isWorkspaceConfigured(): boolean {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return false;

    const vscodeDir = path.join(workspaceFolder, '.vscode');
    if (!fs.existsSync(vscodeDir)) return false;

    const tasksPath = path.join(vscodeDir, 'tasks.json');

    return fs.existsSync(tasksPath);
}
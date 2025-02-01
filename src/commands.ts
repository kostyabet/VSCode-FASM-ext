import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { execFile } from 'child_process';
const { exec } = require('child_process');

import config from "./config"
import helper from "./helper"

async function createConfigCommand() {
    helper.installFasm()
    
    const folderStruct = helper.checkWorkspaceFolder()
    if (!folderStruct.code) return // if error code
    const vscodeDir = folderStruct.dir || "" // check for null string

    const pathStruct = helper.workWithPath()
    if (!pathStruct.code) return // if error code
    const activeFile = pathStruct.file || "" // check for null string
    const outputExecutable = pathStruct.exec || "" // check for null string

    config.createJson(vscodeDir, activeFile, outputExecutable)
}

async function showDropdownCommand() {
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
            vscode.commands.executeCommand('setContext', 'fasm.mode.run', true);
            vscode.commands.executeCommand('setContext', 'fasm.mode.debug', false);
        } else if (selected.command === 'fasm.debug') {
            vscode.commands.executeCommand('setContext', 'fasm.mode.run', false);
            vscode.commands.executeCommand('setContext', 'fasm.mode.debug', true);
        }
    }
}

async function debugCommand(extensionPath : string) {
    vscode.window.showInformationMessage('Debugging FASM...');
            
    const programPath = path.join(extensionPath, 'bin/ollydbg', 'ollydbg.exe');
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
}

async function runCommand() {
    vscode.window.showInformationMessage('Running FASM...');
        
    if (!helper.isWorkspaceConfigured()) {
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
}

export default {
    createConfigCommand, 
    showDropdownCommand,
    debugCommand,
    runCommand
}
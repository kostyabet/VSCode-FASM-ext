import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { execFile } from 'child_process';
const { exec } = require('child_process');

import config from "./config"
import helper from "./helper"

async function runCommand() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return;
        
    const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
    const tasksConfig = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    const outputExecutable =  tasksConfig.executionFilePath;
            
    exec(outputExecutable);
}


async function createConfigCommand() {
    const fasmChoice = await vscode.window.showQuickPick(
        [
            {
                label: '$(cloud-download) Download FASM automatically',
                description: 'Recommended for most users',
                value: 'auto'
            },
            {
                label: '$(folder) Use existing FASM installation',
                description: 'I already have FASM installed',
                value: 'manual'
            },
            {
                label: '$(close) Skip FASM setup',
                description: 'Configure later or use different assembler',
                value: 'skip'
            }
        ],
        {
            placeHolder: 'How would you like to set up FASM assembler?',
            ignoreFocusOut: true,
            title: 'FASM Setup'
        }
    );
    
    if (!fasmChoice) {
        vscode.window.showWarningMessage("Configuration creation canceled.");
        return null;
    }
    
    let fasmPath = "";
    let includePath = "";
    
    switch (fasmChoice.value) {
        case 'auto':
            vscode.window.showInformationMessage("Downloading and installing FASM...");
            try {
                await helper.installFasm();
                const parentDir = path.dirname(__dirname);
                fasmPath = path.join(parentDir, "bin", "fasm");
                includePath = path.join(fasmPath, "include");
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to install FASM.`);
                const retry = await vscode.window.showWarningMessage(
                    "FASM installation failed. Try manual setup?",
                    "Yes", "No"
                );
                if (retry === "Yes") {
                    fasmChoice.value = 'manual';
                } else {
                    return null;
                }
            }
            break;
            
        case 'manual':
            const manualPath = await vscode.window.showInputBox({
                prompt: "Enter path to FASM executable directory",
                placeHolder: "Example: C:\\Program Files\\FASM",
                ignoreFocusOut: true
            });
            
            if (manualPath === undefined) {
                vscode.window.showWarningMessage("Configuration creation canceled.");
                return null;
            }
            
            fasmPath = manualPath || "";
            
            if (fasmPath) {
                const useDefaultInclude = await vscode.window.showQuickPick(
                    ['Yes, use default include path', 'No, specify custom path'],
                    {
                        placeHolder: `Use default include path (${path.join(fasmPath, 'include')})?`,
                        ignoreFocusOut: true
                    }
                );
                
                if (useDefaultInclude === 'No, specify custom path') {
                    const customIncludePath = await vscode.window.showInputBox({
                        prompt: "Enter custom include path",
                        placeHolder: "Example: C:\\Program Files\\FASM\\INCLUDE",
                        ignoreFocusOut: true
                    });
                    includePath = customIncludePath || "";
                } else {
                    includePath = path.join(fasmPath, 'include');
                }
            }
            break;
            
        case 'skip':
            vscode.window.showInformationMessage("Skipping FASM setup. You can configure it later in settings.");
            break;
    }
    
    let debuggerPath = "";
    
    const debuggerChoice = await vscode.window.showQuickPick(
        [
            {
                label: '$(debug) Configure debugger',
                description: 'Set up debugger path',
                value: 'configure'
            },
            {
                label: '$(debug-step-over) Skip debugger',
                description: 'Configure later or not needed',
                value: 'skip'
            }
        ],
        {
            placeHolder: 'Would you like to configure a debugger?',
            ignoreFocusOut: true,
            title: 'Debugger Configuration'
        }
    );
    
    if (!debuggerChoice) {
        vscode.window.showWarningMessage("Configuration creation canceled.");
        return null;
    }
    
    if (debuggerChoice.value === 'configure') {
        const debuggerInput = await vscode.window.showInputBox({
            prompt: "Enter path to debugger executable (optional)",
            placeHolder: "Example: C:\\Program Files\\FASM\\debugger.exe",
            ignoreFocusOut: true
        });
        
        if (debuggerInput === undefined) {
            vscode.window.showWarningMessage("Configuration creation canceled.");
            return null;
        }
        
        debuggerPath = debuggerInput || "";
    }
    
    const folderStruct = helper.checkWorkspaceFolder();
    if (!folderStruct.code) return;
    const vscodeDir = folderStruct.dir || "";

    const pathStruct = helper.workWithPath();
    if (!pathStruct.code) return;
    const activeFile = pathStruct.file || "";
    const outputExecutable = pathStruct.exec || "";

    try {
        if (fasmPath) {
            await vscode.workspace.getConfiguration().update(
                'fasm.assemblerPath', 
                fasmPath, 
                vscode.ConfigurationTarget.Workspace
            );
        }
        
        if (includePath) {
            await vscode.workspace.getConfiguration().update(
                'fasm.includePath', 
                includePath, 
                vscode.ConfigurationTarget.Workspace
            );
        }
        
        config.createJson(vscodeDir, activeFile, outputExecutable, debuggerPath);
        
        let successMessage = "Configuration created successfully!";
        if (!debuggerPath) {
            successMessage += " (without debugger)";
        }
        if (fasmChoice.value === 'skip') {
            successMessage += " - FASM not configured";
        } else {
            successMessage += ` - FASM ${fasmChoice.value === 'auto' ? 'installed' : 'configured'}`;
        }
        
        vscode.window.showInformationMessage(successMessage);
        
        const openSettings = await vscode.window.showInformationMessage(
            "Configuration complete. Would you like to review the settings?",
            "Open Settings", "No Thanks"
        );
        
        if (openSettings === "Open Settings") {
            vscode.commands.executeCommand('workbench.action.openSettings', 'fasm');
        }
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create configuration.`);
    }
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
    vscode.window.showInformationMessage('Debugging...');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return;

    const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
    if (!fs.existsSync(tasksPath)) {
        vscode.window.showErrorMessage('tasks.json not found.');
        return;
    }
    
    const tasksConfig = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    const debuggerPath = tasksConfig.debuggerFilePath;
    const outputExecutable = tasksConfig.executionFilePath;
    
    if (!fs.existsSync(debuggerPath)) {
        vscode.window.showErrorMessage(`debugger not found at: ${debuggerPath}`);
        return;
    }
    
    execFile(debuggerPath, [outputExecutable]);
}

async function buildCommand() {
    vscode.window.showInformationMessage('Build FASM...');
        
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
    buildCommand,
    createConfigCommand, 
    showDropdownCommand,
    debugCommand,
    runCommand
}
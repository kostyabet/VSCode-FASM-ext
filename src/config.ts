import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

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

function createJson(vscodeDir : string, activeFile : string, outputExecutable : string) {
    try {
        const tasksPath = path.join(vscodeDir, 'tasks.json');
            
        const tasksConfig = {
            version: "2.0.0",
            tasks: [
                {
                    label: "Build FASM",
                    type: "shell",
                    command: "fasm",
                    args: [
                        activeFile, 
                        outputExecutable
                    ],
                    group: "build",
                    problemMatcher: [],
                    options: {
                        env: {
                            FASM: "${config:fasm.assemblerPath}",
                            INCLUDE: "${config:fasm.includePath}"
                        }
                    }
                }
            ],
            activeFilePath: activeFile,
            executionFilePath: outputExecutable
        };
            
        fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
            
        vscode.window.showInformationMessage(`FASM configs created for: ${activeFile}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating configs: ${error}`);
    }
}

export default {
    checkAndCreateConfigs,
    createJson
}
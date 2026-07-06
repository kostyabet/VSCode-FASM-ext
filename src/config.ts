import * as os from 'os';
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

  
function quote(p: string): string {
    return `"${p.replace(/"/g, '\\"')}"`;
}

function createJson(vscodeDir : string, activeFile : string, outputExecutable : string, debuggerPath: string, additionalOutput: string | null) {
    try {
        const tasksPath = path.join(vscodeDir, 'tasks.json');
        const fasmPath = path.join("${config:fasm.assemblerPath}", "fasm.exe");

        const buildTask: Record<string, unknown> = {
            label: "Build FASM",
            type: "shell",
            group: "build",
            problemMatcher: [],
            options: {
                env: {
                    FASM: "${config:fasm.assemblerPath}",
                    INCLUDE: "${config:fasm.includePath}"
                }
            }
        };

        if (additionalOutput) {
            const copyCmd = os.platform() === "win32" ? "copy /Y" : "cp -f";
            buildTask.command = [
                quote(fasmPath),
                quote(activeFile),
                quote(outputExecutable),
                "&&",
                copyCmd,
                quote(outputExecutable),
                quote(additionalOutput)
            ].join(" ");
        } else {
            buildTask.command = fasmPath;
            buildTask.args = [activeFile, outputExecutable];
        }

        const tasksConfig = {
            version: "2.0.0",
            tasks: [buildTask],
            activeFilePath: activeFile,
            executionFilePath: outputExecutable,
            additionalOutputFilePath: additionalOutput || "",
            debuggerFilePath: debuggerPath
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
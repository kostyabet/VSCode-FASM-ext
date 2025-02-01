
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from "os";
import * as https from "https";
import { execFile } from 'child_process';
import * as unzipper from "unzipper";
import * as tar from "tar";
const { exec } = require('child_process');

let runStatusBarItem: vscode.StatusBarItem;
let currentMode: 'run' | 'debug' = 'run';

import regExp from "./regExpStrings"

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand('setContext', 'fasm.mode.run', true);
    vscode.commands.executeCommand('setContext', 'fasm.mode.debug', false);
    const provider = vscode.languages.registerCompletionItemProvider('fasm', {
        provideCompletionItems() {
            const completionItems = [
                ...regExp.fasmInstructions.map(instruction => 
                    new vscode.CompletionItem(instruction, vscode.CompletionItemKind.Keyword)),
                ...regExp.fasmRegisters.map(register => 
                    new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable)),
                ...regExp.fasmMacros.map(macro => 
                    new vscode.CompletionItem(macro, vscode.CompletionItemKind.Function))
            ];
            return completionItems;
        }
    });
    
    let configuredFilePath: string | undefined;
    
        const createConfigsCommand = vscode.commands.registerCommand('fasm.createConfigs', async () => {
            try {
                const { url, filename, isZip } = getFasmDownloadUrl();
                const outputPath = path.join(__dirname, filename);
                const parentDir = path.dirname(__dirname);
                const extractPath = path.join(parentDir, "bin", "fasm");
            
                vscode.window.showInformationMessage(`Downloading FASM for ${os.platform()}...`);
                await downloadFile(url, outputPath);
            
                vscode.window.showInformationMessage("Extracting...");
                if (isZip) {
                    await unzipFile(outputPath, extractPath);
                } else {
                    await untarFile(outputPath, extractPath);
                }
            
                const includePath = path.join(extractPath, "include");
                await vscode.workspace.getConfiguration().update('fasm.assemblerPath', extractPath, vscode.ConfigurationTarget.Global);
                await vscode.workspace.getConfiguration().update('fasm.includePath', includePath, vscode.ConfigurationTarget.Global);
            
                vscode.window.showInformationMessage(`FASM installed successfully at ${extractPath}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error`);
            }
            

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open!');
                return;
            }
        
            const vscodeDir = path.join(workspaceFolder, '.vscode');
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir);
            }
        
            const activeFile = vscode.window.activeTextEditor?.document.fileName;
            if (!activeFile) {
                vscode.window.showErrorMessage('No active FASM file!');
                return;
            }
            
            const parsedPath = path.parse(activeFile);
            let outputExecutable = "";
            if (os.platform() === "win32") {
                outputExecutable = path.join(parsedPath.dir, parsedPath.name + ".exe");
            } else {
                outputExecutable = path.join(parsedPath.dir, parsedPath.name);
            }
            
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

            
        });
    

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

async function getExecutionFilePath(): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) return;

    const tasksPath = path.join(workspaceFolder, '.vscode', 'tasks.json');
    if (!fs.existsSync(tasksPath)) {
        vscode.window.showErrorMessage('tasks.json не найден.');
        return;
    }

    const tasksConfig = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));

    return tasksConfig.executionFilePath;
       
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

function getFasmDownloadUrl(): { url: string; filename: string; isZip: boolean } {
    const platform = os.platform();
  
    if (platform === "win32") {
      return { url: "https://flatassembler.net/fasmw17332.zip", filename: "fasmw17332.zip", isZip: true };
    } else if (platform === "linux" || platform === "darwin") {
      return { url: "https://flatassembler.net/fasm-1.73.32.tgz", filename: "fasm-1.73.32.tgz", isZip: false };
    } else {
      throw new Error("Unsupported OS");
    }
}

function downloadFile(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${outputPath}`);
          resolve();
        });
      }).on("error", (err) => {
        fs.unlink(outputPath, () => {}); 
        reject(err);
      });
    });
}

async function unzipFile(zipPath: string, extractPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", () => {
          console.log(`Unzipped to: ${extractPath}`);
          resolve();
        })
        .on("error", reject);
    });
}

async function untarFile(tarPath: string, extractPath: string): Promise<void> {
    return tar.x({
      file: tarPath,
      cwd: extractPath,
    }).then(() => {
      console.log(`Extracted to: ${extractPath}`);
    });
}




import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
const { exec } = require('child_process');

let runStatusBarItem: vscode.StatusBarItem;
let currentMode: 'run' | 'debug' = 'run';

const fasmInstructions = `
aaa|aad|abs|aam|adc|add|and|arpl|bound|bsf|bsr|bswap|bt|btc|btr|bts|call|cbw|cdq|clc|cld|cli|clts|cmc|cmp|cmps|cmpsb|cmpsd|cmpsw|cmpxchg|cwd|cwde|daa|das|dec|div|emms|enter|f2xm1|fabs|fadd|faddp|fbld|fbstp|fchs|fclex|fcmovb|fcmovbe|fcmove|fcmovnb|fcmovnbe|fcmovne|fcmovnu|fcmovu|fcom|fcomi|fcomip|fcomp|fcompp|fcos|fdecstp|fdiv|fdivp|fdivr|fdivrp|femms|ffree|fiadd|ficom|ficomp|fidiv|fidivr|fild|fimul|fincstp|finit|fist|fistp|fisub|fisubr|fld|fld1|fldcw|fldenv|fldl2e|fldl2t|fldlg2|fldln2|fldpi|fldz|fmul|fmulp|fnclex|fninit|fnop|fnsave|fnstcw|fnstenv|fnstsw|fpatan|fprem1|fptan|frndint|frstor|fsave|fscale|fsin|fsincos|fsqrt|fst|fstcw|fstenv|fstp|fstsw|fsub|fsubp|fsubr|fsubrp|ftst|fucom|fucomi|fucomip|fucomp|fucompp|fwait|fxch|fxtract|fyl2xp1|hlt|idiv|imul|in|inc|ins|insb|insd|insw|int|into|invd|invlpg|iret|iretd|iretw|ja|jae|jb|jbe|jc|jcxz|je|jecxz|jg|jge|jl|jle|jmp|jna|jnae|jnb|jnbe|jnc|jne|jng|jnge|jnl|jnle|jno|jnp|jns|jnz|jo|jp|jpe|jpo|js|jz|lahf|lar|lds|lea|leave|les|lfs|lgdt|lgs|lidt|lldt|lmsw|lock|lods|lodsb|lodsd|lodsw|loop|loope|loopne|loopnz|loopz|lsl|lss|ltr|mov|movd|movq|movs|movsb|movsd|movsw|movsx|movzx|mul|neg|nop|not|or|out|outs|outsb|outsd|outsw|packssdw|packsswb|packuswb|paddb|paddd|paddsb|paddsw|paddusb|paddusw|paddw|pand|pandn|pavgusb|pcmpeqb|pcmpeqd|pcmpeqw|pcmpgtb|pcmpgtd|pcmpgtw|pf2id|pfacc|pfadd|pfcmpeq|pfcmpge|pfcmpgt|pfmax|pfmin|pfmul|pfrcp|pfrcpit1|pfrcpit2|pfrsqit1|pfrsqrt|pfsub|pfsubr|pi2fd|pmaddwd|pmulhrw|pmulhw|pmullw|pop|popa|popad|popaw|popf|popfd|popfw|por|prefetch|prefetchw|pslld|psllq|psllw|psrad|psraw|psrld|psrlq|psrlw|psubb|psubd|psubsb|psubsw|psubusb|psubusw|psubw|punpckhbw|punpckhdq|punpckhwd|punpcklbw|punpckldq|punpcklwd|push|pusha|pushad|pushaw|pushf|pushfd|pushfw|pxor|rcl|rcr|rep|repe|repne|repnz|repz|ret|rol|ror|sahf|sal|sar|sbb|scas|scasb|scasd|scasw|seta|setae|setb|setbe|setc|sete|setg|setge|setl|setle|setna|setnae|setnb|setnbe|setnc|setne|setng|setnge|setnl|setnle|setno|setnp|setns|setnz|seto|setp|setpo|sets|setz|sgdt|shl|shld|shr|shrd|sidt|sldt|smsw|stc|std|sti|stos|stosb|stosd|stosw|str|sub|test|verr|verw|wait|wbinvd|xadd|xchg|xlat|xlatb|xor|rdtsc|cpuid
`.split('|');

const fasmRegisters = `eax|ax|al|ah|ebx|bx|bl|bh|ecx|cx|cl|ch|edx|dx|dl|dh|esi|si|edi|di|ebp|bp|esp|sp|cs|ds|es|ss|gs|fs|mm0|mm1|mm2|mm3|mm4|mm5|mm6|mm7|xmm0|xmm1|xmm2|xmm3|xmm4|xmm5|xmm6|xmm7|rbx|rsp|rcx|rax|rdx|rbp|rsi|rdi|rip|r8|r8d|r9|r9d|r10|r10d|r11|r11d|r12|r12d|r13|r13d|r14|r14d|r15|r15d|cr0|cr2|cr3|cr4|dr0|dr1|dr2|dr3|dr6|dr7|st0|st1|st2|st3|st4|st5|st6|st7|ymm0|ymm1|ymm2|ymm3|ymm4|ymm5|ymm6|ymm7|ymm8|ymm9
`.split('|');

const fasmMacros = `model|flat|stdcall|option|casemap|none|const|include|includelib|proto|data|code|segment|ends|public|use32|use16|assume|byte|word|dword|qword|tword|db|dw|dd|dq|dt|rb|equ|macro|vararg|endm|invoke|dup|proc|endp|local|addr|offset|end|mmx|xmm|sizeof|ptr|true|false|format|pe|pe64|console|ms|coff|binary|extrn|as|gui|section|readable|executable|writeable|import|library|entry|resource|directory|interface|struct|union|cominvk|virtual|at|export|fixups|discardable|dll|use64|large|while|endw|repeat|for|break|if|elseif|else|endif|native|notpageable|uses|align|stack|restore|purge|common|forward|reverse|eq|eqtype|fword|pword|tbyte|dqword|from|shareable|heap|mz|ms64|elf|elf64|du|rw|rd|dp|df|rp|rf|rq|rt|rva|near|far|define|irp|irps|match|rept|restruc|note|dynamic|linkinfo|efiruntime|linkremove|interpreter|static|efiboot|comcall|locals|endl|qqword|xword|yword|ccall|cinvoke|struc|fix|org|file|menu|menuitem|menuseparator|dialog|dialogitem|enddialog|icon|bitmap|cursor|resdata|endres|accelerator|versioninfo`.split('|');

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand('setContext', 'fasm.mode.run', true);
    vscode.commands.executeCommand('setContext', 'fasm.mode.debug', false);
    const provider = vscode.languages.registerCompletionItemProvider('fasm', {
        provideCompletionItems() {
            const completionItems = [
                ...fasmInstructions.map(instruction => 
                    new vscode.CompletionItem(instruction, vscode.CompletionItemKind.Keyword)),
                ...fasmRegisters.map(register => 
                    new vscode.CompletionItem(register, vscode.CompletionItemKind.Variable)),
                ...fasmMacros.map(macro => 
                    new vscode.CompletionItem(macro, vscode.CompletionItemKind.Function))
            ];
            return completionItems;
        }
    });
    
    let configuredFilePath: string | undefined;
    
    const createConfigsCommand = vscode.commands.registerCommand('fasm.createConfigs', async () => {
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
        const outputExecutable = path.join(parsedPath.dir, parsedPath.name + '.exe');
        
    
        try {
            const tasksPath = path.join(vscodeDir, 'tasks.json');
    
            const tasksConfig = {
                version: "2.0.0",
                tasks: [
                    {
                        label: "Build FASM",
                        type: "shell",
                        command: "${config:fasm.assemblerPath}",
                        args: [
                            activeFile, 
                            outputExecutable
                        ],
                        group: "build",
                        problemMatcher: [],
                        options: {
                            env: {
                                INCLUDE: "C:/FASM/INCLUDE/"
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

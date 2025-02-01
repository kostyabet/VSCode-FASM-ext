import * as vscode from 'vscode';
import regExp from "./regExpStrings"

function completitionProviderString() {
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

export default completitionProviderString
import * as vscode from 'vscode';
const { createLoopDecoration, getLoopDecorations } = require('./decorations/loop_decoration');

export function activate(context: vscode.ExtensionContext) {
    const decorationType = createLoopDecoration();

    const updateDecorations = (editor : any) => {
        const decorations = getLoopDecorations(editor);
        editor.setDecorations(decorationType, decorations);
        console.log(`Decorations updated: ${decorations.length}`);
    };

    let disposable = vscode.commands.registerCommand('extension.highlightLoops', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const decorations = getLoopDecorations(activeEditor);
            activeEditor.setDecorations(decorationType, decorations);
            console.log(`Decorations set: ${decorations.length}`);
        } else {
            console.log('No active editor found');
        }
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && event.document === activeEditor.document) {
                updateDecorations(activeEditor);
            }
        })
    );
}

export function deactivate() {}

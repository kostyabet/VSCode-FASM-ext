import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Test register buttons and provider', () => {
	test('Register buttons test', async () => {
		await vscode.commands.executeCommand('setContext', 'fasm.mode.run', true);
		const runContext = vscode.workspace.getConfiguration().get('fasm.mode.run');
		assert.strictEqual(runContext, true, 'Context fasm.mode.run do not set like true');

		await vscode.commands.executeCommand('setContext', 'fasm.mode.debug', true);
		const debugContext = vscode.workspace.getConfiguration().get('fasm.mode.debug');
		assert.strictEqual(debugContext, true, 'Context fasm.mode.debug do not set like true');
	});
});

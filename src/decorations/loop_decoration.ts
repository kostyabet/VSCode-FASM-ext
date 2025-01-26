const vscode = require("vscode");

function createLoopDecoration() {
    return vscode.window.createTextEditorDecorationType({
        textDecoration: 'none', // Убираем любые текстовые украшения
        before: {
            contentText: ' ', // Используйте пробелы для смещения
            backgroundColor: 'lightblue', // Цвет линии
            border: 'none', // Убираем рамку
            width: '2px', // Ширина линии
            height: '5px', // Полная высота строки
            display: 'inline-block', // Чтобы поведение было как у блока
        }
    });
}

function getLoopDecorations(editor : any) {
    const text = editor.document.getText();
    const lines = text.split('\n');
    const decorations : any = [];
    const labelMap = new Map();

    // Находим метки
    lines.forEach((line : string, lineNumber : number) => {
        const labelMatch = line.match(/^([a-zA-Z]+):/);
        if (labelMatch) {
            labelMap.set(labelMatch[1], lineNumber);
        }
    });

    // Находим конструкции loop
    lines.forEach((line : string, lineNumber : number) => {
        const loopMatch = line.match(/^\s*loop\s+([a-zA-Z]+)/);
        if (loopMatch && labelMap.has(loopMatch[1])) {
            const start = labelMap.get(loopMatch[1]);
            const end = lineNumber;
            decorations.push(new vscode.Range(start, 0, end, 0));
        }
    });

    return decorations;
}

module.exports = {
    createLoopDecoration,
    getLoopDecorations,
};
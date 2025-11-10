import React, { useRef, useState, useEffect } from 'react';

// --- ICONS (Updated based on user feedback) ---
const IconClear = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7z"/><path d="M5 12.5 12 5.5"/></svg>;
const IconUndo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
const IconRedo = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3-2.3"/></svg>;
const IconBold = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const IconItalic = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IconUnderline = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const IconStrikethrough = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12"/><path d="M12 4v16"/><line x1="4" y1="12" x2="20" y2="12"/></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconListOrdered = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4l2-2h-2v-2"/></svg>;

// --- UNICODE MAPS ---
const fontMaps = {
  bold: {"A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗩","W":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭","a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":"𝗾","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𘅅","y":"𝘆","z":"𝘇","0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵"},
  italic: {"A":"𝘈","B":"𝘉","C":"𝘊","D":"𝘋","E":"𝘌","F":"𝘍","G":"𝘎","H":"𝘏","I":"𝘐","J":"𝘑","K":"𝘒","L":"𝘓","M":"𝘔","N":"𝘕","O":"𝘖","P":"𝘗","Q":"𝘘","R":"𝘙","S":"𝘚","T":"𝘛","U":"𝘜","V":"𝘝","W":"𝘞","X":"𝘟","Y":"𝘠","Z":"𝘡","a":"𝘢","b":"𝘣","c":"𝘤","d":"𝘥","e":"𝘦","f":"𝘧","g":"𝘨","h":"𝘩","i":"𝘪","j":"𝘫","k":"𝘬","l":"𝘭","m":"𝘮","n":"𝘯","o":"𝘰","p":"𝘱","q":"𝘲","r":"𝘳","s":"𝘴","t":"𝘵","u":"𝘶","v":"𝘷","w":"𝘸","x":"𝘹","y":"𝘺","z":"𝘻"}
};

// --- HELPER FUNCTIONS ---
const applyUnicodeStyle = (text: string, map: Record<string, string>): string => {
  return text.split('').map(char => map[char] || char).join('');
};

const applyCombiningChar = (text: string, charCode: string): string => {
  return text.split('').join(charCode) + charCode;
};

// --- COMPONENT ---
interface TextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  rows: number;
  placeholder: string;
}

const ToolbarButton: React.FC<React.PropsWithChildren<{ onClick: () => void; disabled?: boolean; title: string }>> = ({ onClick, disabled = false, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:text-gray-400 disabled:hover:bg-transparent dark:disabled:text-gray-500"
  >
    {children}
  </button>
);

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange, rows, placeholder }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [history, setHistory] = useState([value]);
    const [historyIndex, setHistoryIndex] = useState(0);

    useEffect(() => {
        if (value !== history[historyIndex]) {
             setHistory([value]);
             setHistoryIndex(0);
        }
    }, [value, history, historyIndex]);

    const updateContent = (newValue: string, fromHistory = false) => {
        if (!fromHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newValue);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        onChange(newValue);
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateContent(e.target.value);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            updateContent(history[newIndex], true);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            updateContent(history[newIndex], true);
        }
    };
    
    const handleClear = () => {
        updateContent('');
    }

    const applyFormat = (style: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart === selectionEnd) return;

        const selectedText = value.substring(selectionStart, selectionEnd);
        let transformedText = '';

        switch (style) {
            case 'bold': transformedText = applyUnicodeStyle(selectedText, fontMaps.bold); break;
            case 'italic': transformedText = applyUnicodeStyle(selectedText, fontMaps.italic); break;
            case 'underline': transformedText = applyCombiningChar(selectedText, '\u0332'); break;
            case 'strikethrough': transformedText = applyCombiningChar(selectedText, '\u0336'); break;
        }

        const newValue = value.substring(0, selectionStart) + transformedText + value.substring(selectionEnd);
        updateContent(newValue);

        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionStart + transformedText.length);
    };
    
    const applyList = (type: 'bullet' | 'ordered') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const { selectionStart, selectionEnd } = textarea;
        
        // Find the start and end of the line(s) containing the selection
        let lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        let lineEnd = value.indexOf('\n', selectionEnd);
        if (lineEnd === -1) lineEnd = value.length;

        const selectedLinesText = value.substring(lineStart, lineEnd);
        const lines = selectedLinesText.split('\n');
        let listCounter = 1;
        
        const transformedLines = lines.map(line => {
            if (line.trim() === '') return line;
            if (type === 'bullet') {
                return `• ${line.replace(/^•\s*/, '')}`;
            } else {
                return `${listCounter++}. ${line.replace(/^\d+\.\s*/, '')}`;
            }
        });
        
        const newLinesText = transformedLines.join('\n');
        const newValue = value.substring(0, lineStart) + newLinesText + value.substring(lineEnd);
        updateContent(newValue);

        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart + newLinesText.length);
    };

    return (
        <div className="border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-brand-secondary focus-within:border-brand-secondary">
            <div className="p-1 border-b border-gray-300 dark:border-dark-border flex flex-wrap items-center gap-1 text-gray-700 dark:text-gray-200">
                <ToolbarButton onClick={handleClear} title="Limpar"><IconClear /></ToolbarButton>
                <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-1"></div>
                <ToolbarButton onClick={handleUndo} disabled={historyIndex === 0} title="Voltar"><IconUndo /></ToolbarButton>
                <ToolbarButton onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Avançar"><IconRedo /></ToolbarButton>
                <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-1"></div>
                <ToolbarButton onClick={() => applyFormat('bold')} title="Negrito"><IconBold /></ToolbarButton>
                <ToolbarButton onClick={() => applyFormat('italic')} title="Itálico"><IconItalic /></ToolbarButton>
                <ToolbarButton onClick={() => applyFormat('underline')} title="Sublinhado"><IconUnderline /></ToolbarButton>
                <ToolbarButton onClick={() => applyFormat('strikethrough')} title="Taxado"><IconStrikethrough /></ToolbarButton>
                <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-1"></div>
                <ToolbarButton onClick={() => applyList('bullet')} title="Pontos de tópico"><IconList /></ToolbarButton>
                <ToolbarButton onClick={() => applyList('ordered')} title="Lista numerada"><IconListOrdered /></ToolbarButton>
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextareaChange}
                rows={rows}
                className="w-full p-2 bg-transparent dark:text-white focus:outline-none resize-y"
                placeholder={placeholder}
            />
        </div>
    );
};

export default TextEditor;
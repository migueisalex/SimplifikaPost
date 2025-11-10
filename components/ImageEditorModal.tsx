import React, { useState, useCallback, useMemo } from 'react';
import { MediaItem } from '../types';

interface ImageEditorModalProps {
  mediaItem: MediaItem;
  // FIX: Use a specific type for 'edits' to ensure type safety.
  onSave: (editedUrl: string, edits: NonNullable<MediaItem['edits']>) => void;
  onCancel: () => void;
}

const defaultEdits = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  filter: 'none' as 'none' | 'grayscale' | 'sepia' | 'invert',
};

const AdjustmentSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; onReset: () => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, onReset, min = 0, max = 200, step = 1 }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <button onClick={onReset} className="text-xs font-semibold text-gray-500 hover:text-brand-primary">Restaurar</button>
        </div>
        <div className="flex items-center gap-2">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full"
            />
            <span className="text-sm font-mono w-10 text-center">{value}</span>
        </div>
    </div>
);

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ mediaItem, onSave, onCancel }) => {
  const [edits, setEdits] = useState(mediaItem.edits || defaultEdits);

  const generateFilterString = useCallback(() => {
    const { brightness, contrast, saturate, blur, filter } = edits;
    const filterParts = [
      `brightness(${brightness / 100})`,
      `contrast(${contrast / 100})`,
      `saturate(${saturate / 100})`,
      `blur(${blur}px)`,
    ];
    
    if (filter === 'grayscale') filterParts.push('grayscale(100%)');
    if (filter === 'sepia') filterParts.push('sepia(100%)');
    if (filter === 'invert') filterParts.push('invert(100%)');
    
    return filterParts.join(' ');
  }, [edits]);

  const filterStyle = useMemo(() => ({ filter: generateFilterString() }), [generateFilterString]);

  const handleSave = () => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // Handle potential CORS issues if using external images
    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            alert("Não foi possível processar a imagem.");
            return;
        }

        ctx.filter = generateFilterString();
        ctx.drawImage(image, 0, 0);
        
        const editedUrl = canvas.toDataURL('image/jpeg', 0.92);
        onSave(editedUrl, edits);
    };
    image.src = mediaItem.originalUrl;
  };

  const setFilter = (filter: typeof defaultEdits.filter) => {
    setEdits(prev => ({...prev, filter}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Editor de Imagem</h3>
        </div>
        
        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          {/* Image Preview */}
          <div className="flex-grow p-4 flex justify-center items-center bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
             <img 
                src={mediaItem.originalUrl} 
                alt="Preview da Edição" 
                style={filterStyle}
                className="max-w-full max-h-full object-contain"
             />
          </div>

          {/* Controls Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0 bg-gray-50 dark:bg-dark-card border-l dark:border-dark-border flex flex-col">
              <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 dark:text-white">Ajustes</h4>
                <AdjustmentSlider label="Brilho" value={edits.brightness} onChange={v => setEdits({...edits, brightness: v})} onReset={() => setEdits({...edits, brightness: 100})} />
                <AdjustmentSlider label="Contraste" value={edits.contrast} onChange={v => setEdits({...edits, contrast: v})} onReset={() => setEdits({...edits, contrast: 100})} />
                <AdjustmentSlider label="Saturação" value={edits.saturate} onChange={v => setEdits({...edits, saturate: v})} onReset={() => setEdits({...edits, saturate: 100})} />
                <AdjustmentSlider label="Desfoque" value={edits.blur} onChange={v => setEdits({...edits, blur: v})} onReset={() => setEdits({...edits, blur: 0})} min={0} max={10} />
                 
                <div className="pt-2 border-t dark:border-dark-border">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Filtros</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setFilter('none')} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'none' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Normal</button>
                        <button onClick={() => setFilter('grayscale')} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'grayscale' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Preto e Branco</button>
                        <button onClick={() => setFilter('sepia')} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'sepia' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Sépia</button>
                        <button onClick={() => setFilter('invert')} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'invert' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Inverter</button>
                    </div>
                </div>
              </div>
              <div className="p-4 border-t dark:border-dark-border">
                  <button onClick={() => setEdits(defaultEdits)} className="w-full py-2 px-4 text-sm bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                      Restaurar Padrão
                  </button>
              </div>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button onClick={onCancel} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancelar
          </button>
          <button onClick={handleSave} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
            Salvar Edições
          </button>
        </div>
      </div>
    </div>
  );
};
export default ImageEditorModal;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MediaItem } from '../types';

interface ImageCropperProps {
  mediaItem: MediaItem;
  aspectRatio: number;
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

const AdjustmentSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
    <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center gap-2 mt-1">
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


const ImageCropper: React.FC<ImageCropperProps> = ({ mediaItem, aspectRatio, onSave, onCancel }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const renderedImageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [widthScale, setWidthScale] = useState(1);
  const [heightScale, setHeightScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [initialState, setInitialState] = useState({ zoom: 1, position: { x: 0, y: 0 } });
  const [imageInitialDims, setImageInitialDims] = useState({ width: 0, height: 0 });
  
  const [edits, setEdits] = useState(mediaItem.edits || defaultEdits);

  const getBoundedPosition = useCallback((x: number, y: number, currentZoom: number, currentWidthScale: number, currentHeightScale: number) => {
    const cropBox = cropBoxRef.current;
    if (!cropBox || imageInitialDims.width === 0) return { x, y };
    const scaledW = imageInitialDims.width * currentZoom * currentWidthScale;
    const scaledH = imageInitialDims.height * currentZoom * currentHeightScale;
    const maxX = Math.max(0, (scaledW - cropBox.offsetWidth) / 2);
    const maxY = Math.max(0, (scaledH - cropBox.offsetHeight) / 2);
    const boundedX = Math.max(-maxX, Math.min(x, maxX));
    const boundedY = Math.max(-maxY, Math.min(y, maxY));
    return { x: boundedX, y: boundedY };
  }, [imageInitialDims]);

  const resetImageState = useCallback(() => {
    const image = imageRef.current;
    const cropBox = cropBoxRef.current;
    const container = containerRef.current;
    if (!image || !cropBox || !container || container.offsetWidth === 0) return;

    const containerRect = container.getBoundingClientRect();
    const imageAspect = image.naturalWidth / image.naturalHeight;
    
    let initialRenderWidth, initialRenderHeight;
     if (containerRect.width / containerRect.height > imageAspect) {
        initialRenderHeight = containerRect.height;
        initialRenderWidth = initialRenderHeight * imageAspect;
    } else {
        initialRenderWidth = containerRect.width;
        initialRenderHeight = initialRenderWidth / imageAspect;
    }

    setImageInitialDims({ width: initialRenderWidth, height: initialRenderHeight });

    const cropBoxRect = cropBox.getBoundingClientRect();
    const scaleToCoverWidth = cropBoxRect.width / initialRenderWidth;
    const scaleToCoverHeight = cropBoxRect.height / initialRenderHeight;
    const minScale = Math.max(scaleToCoverWidth, scaleToCoverHeight);
    
    const initialPosition = { x: 0, y: 0 };
    
    setZoom(minScale);
    setWidthScale(1);
    setHeightScale(1);
    setPosition(initialPosition);
    setInitialState({ zoom: minScale, position: initialPosition });
  }, []);

  useEffect(() => {
    const image = new Image();
    image.src = mediaItem.originalUrl;
    image.onload = () => {
      imageRef.current = image;
      resetImageState();
    };
  }, [mediaItem.originalUrl, resetImageState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      if (imageRef.current?.complete) {
          resetImageState();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [resetImageState]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition(getBoundedPosition(newX, newY, zoom, widthScale, heightScale));
  }, [isDragging, dragStart, zoom, widthScale, heightScale, getBoundedPosition]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    setPosition(pos => getBoundedPosition(pos.x, pos.y, newZoom, widthScale, heightScale));
  };

  const handleWidthChange = (newWidth: number) => {
    let finalWidth = newWidth;
    if (Math.abs(newWidth - 1) < 0.05) finalWidth = 1;
    setWidthScale(finalWidth);
    setPosition(pos => getBoundedPosition(pos.x, pos.y, zoom, finalWidth, heightScale));
  };
    
  const handleHeightChange = (newHeight: number) => {
    let finalHeight = newHeight;
    if (Math.abs(newHeight - 1) < 0.05) finalHeight = 1;
    setHeightScale(finalHeight);
    setPosition(pos => getBoundedPosition(pos.x, pos.y, zoom, widthScale, finalHeight));
  };
  
  const generateFilterString = useCallback(() => {
    const { brightness, contrast, saturate, blur, filter } = edits;
    const filterParts = [
      `brightness(${brightness / 100})`, `contrast(${contrast / 100})`,
      `saturate(${saturate / 100})`, `blur(${blur}px)`,
    ];
    if (filter === 'grayscale') filterParts.push('grayscale(100%)');
    if (filter === 'sepia') filterParts.push('sepia(100%)');
    if (filter === 'invert') filterParts.push('invert(100%)');
    return filterParts.join(' ');
  }, [edits]);

  const filterStyle = useMemo(() => ({ filter: generateFilterString() }), [generateFilterString]);

  const handleSave = () => {
    const image = imageRef.current;
    const cropBox = cropBoxRef.current;
    const renderedImage = renderedImageRef.current;
    if (!image || !cropBox || !renderedImage) return;

    const filteredCanvas = document.createElement('canvas');
    filteredCanvas.width = image.naturalWidth;
    filteredCanvas.height = image.naturalHeight;
    const ctxFiltered = filteredCanvas.getContext('2d');
    if (!ctxFiltered) return;
    ctxFiltered.filter = generateFilterString();
    ctxFiltered.drawImage(image, 0, 0);

    const renderedImageRect = renderedImage.getBoundingClientRect();
    if (renderedImageRect.width === 0 || renderedImageRect.height === 0) return;

    const scaleRatioX = filteredCanvas.width / renderedImageRect.width;
    const scaleRatioY = filteredCanvas.height / renderedImageRect.height;
    
    const cropBoxRect = cropBox.getBoundingClientRect();
    
    const sourceX = (cropBoxRect.left - renderedImageRect.left) * scaleRatioX;
    const sourceY = (cropBoxRect.top - renderedImageRect.top) * scaleRatioY;
    const sourceWidth = cropBoxRect.width * scaleRatioX;
    const sourceHeight = cropBoxRect.height * scaleRatioY;

    const outputCanvas = document.createElement('canvas');
    const outputWidth = Math.min(sourceWidth, 1080);
    const outputHeight = outputWidth / aspectRatio;
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const ctxOutput = outputCanvas.getContext('2d');
    if (!ctxOutput) return;
    
    ctxOutput.drawImage(filteredCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
    onSave(outputCanvas.toDataURL('image/jpeg', 0.92), edits);
  };
  
  const handleResetAll = () => {
    setEdits(defaultEdits);
    setZoom(initialState.zoom);
    setWidthScale(1);
    setHeightScale(1);
    setPosition(initialState.position);
  };

  const isPortraitOrSquare = aspectRatio <= 1;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Editar Mídia</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ajuste o recorte, aplique filtros e salve.</p>
        </div>
        
        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          <div ref={containerRef} className="flex-grow p-4 flex justify-center items-center bg-gray-200 dark:bg-gray-800 relative overflow-hidden select-none">
            <div
              className="relative cursor-grab active:cursor-grabbing"
              style={{
                  width: `${imageInitialDims.width}px`,
                  height: `${imageInitialDims.height}px`,
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom * widthScale}, ${zoom * heightScale})`,
                  transformOrigin: 'center',
              }}
              onMouseDown={handleMouseDown}
            >
              {imageRef.current && (
                <img ref={renderedImageRef} src={mediaItem.originalUrl} style={filterStyle} alt="Aguardando imagem..." className="pointer-events-none w-full h-full object-cover"/>
              )}
            </div>
            <div
              ref={cropBoxRef}
              className="absolute"
              style={{
                width: isPortraitOrSquare ? 'auto' : '95%',
                height: isPortraitOrSquare ? '95%' : 'auto',
                aspectRatio: `${aspectRatio}`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                border: '1px solid white',
                pointerEvents: 'none',
              }}
            >
              <div className="absolute top-0 left-1/3 w-px h-full bg-white/40"></div>
              <div className="absolute top-0 left-2/3 w-px h-full bg-white/40"></div>
              <div className="absolute top-1/3 left-0 w-full h-px bg-white/40"></div>
              <div className="absolute top-2/3 left-0 w-full h-px bg-white/40"></div>
            </div>
          </div>

          <div className="w-full md:w-80 flex-shrink-0 bg-gray-50 dark:bg-dark-card border-l dark:border-dark-border flex flex-col">
              <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 dark:text-white">Recorte & Zoom</h4>
                <AdjustmentSlider label="Zoom" value={Math.round(zoom * 100)} onChange={v => handleZoomChange(v / 100)} min={Math.round(initialState.zoom * 100)} max={Math.round(initialState.zoom * 400)} />
                <AdjustmentSlider label="Escala H" value={Math.round(widthScale * 100)} onChange={v => handleWidthChange(v/100)} min={50} max={200} />
                <AdjustmentSlider label="Escala V" value={Math.round(heightScale * 100)} onChange={v => handleHeightChange(v/100)} min={50} max={200} />

                <div className="pt-2 border-t dark:border-dark-border">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Ajustes</h4>
                  <AdjustmentSlider label="Brilho" value={edits.brightness} onChange={v => setEdits({...edits, brightness: v})} />
                  <AdjustmentSlider label="Contraste" value={edits.contrast} onChange={v => setEdits({...edits, contrast: v})} />
                  <AdjustmentSlider label="Saturação" value={edits.saturate} onChange={v => setEdits({...edits, saturate: v})} />
                  <AdjustmentSlider label="Desfoque" value={edits.blur} onChange={v => setEdits({...edits, blur: v})} min={0} max={10} />
                </div>
                 
                <div className="pt-2 border-t dark:border-dark-border">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Filtros</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setEdits(prev => ({...prev, filter: 'none'}))} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'none' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Normal</button>
                        <button onClick={() => setEdits(prev => ({...prev, filter: 'grayscale'}))} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'grayscale' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Preto e Branco</button>
                        <button onClick={() => setEdits(prev => ({...prev, filter: 'sepia'}))} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'sepia' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Sépia</button>
                        <button onClick={() => setEdits(prev => ({...prev, filter: 'invert'}))} className={`p-2 text-sm font-semibold rounded-md border-2 ${edits.filter === 'invert' ? 'border-brand-primary' : 'border-transparent'} hover:border-brand-secondary transition`}>Inverter</button>
                    </div>
                </div>
              </div>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-3 flex justify-between items-center rounded-b-lg border-t dark:border-dark-border">
            <button onClick={handleResetAll} className="py-2 px-4 text-sm bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Restaurar Padrões
            </button>
            <div className="flex justify-end gap-4">
              <button onClick={onCancel} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Cancelar
              </button>
              <button onClick={handleSave} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                Salvar Alterações
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default ImageCropper;
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number;
  onSave: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, aspectRatio, onSave, onCancel }) => {
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

  const getAspectRatioLabel = () => {
      if (aspectRatio === 1) return '1:1 (Quadrado)';
      if (Math.abs(aspectRatio - 4/5) < 0.01) return '4:5 (Retrato)';
      if (Math.abs(aspectRatio - 16/9) < 0.01) return '16:9 (Horizontal)';
      if (Math.abs(aspectRatio - 3/4) < 0.01) return '3:4 (Retrato)';
      if (Math.abs(aspectRatio - 9/16) < 0.01) return '9:16 (Vertical)';
      return 'Personalizado';
  }
  
  const getBoundedPosition = useCallback((x: number, y: number, currentZoom: number, currentWidthScale: number, currentHeightScale: number) => {
    const cropBox = cropBoxRef.current;
    
    if (!cropBox || imageInitialDims.width === 0) {
      return { x, y };
    }
    
    const scaledW = imageInitialDims.width * currentZoom * currentWidthScale;
    const scaledH = imageInitialDims.height * currentZoom * currentHeightScale;

    // Calculate maximum travel distances from a centered position
    const maxX = Math.max(0, (scaledW - cropBox.offsetWidth) / 2);
    const maxY = Math.max(0, (scaledH - cropBox.offsetHeight) / 2);
    
    // The center of the image relative to the crop box center
    // A centered image has (0,0) offset
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
    // Fit image to container initially
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
    image.src = imageSrc;
    image.onload = () => {
      imageRef.current = image;
      resetImageState(); // Initial reset attempt
    };
  }, [imageSrc, resetImageState]);

    useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Use ResizeObserver to reliably get container dimensions on first layout and on changes.
    const observer = new ResizeObserver(() => {
      if (imageRef.current?.complete) { // Only reset if image is loaded
          resetImageState();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [resetImageState]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition(getBoundedPosition(newX, newY, zoom, widthScale, heightScale));
  }, [isDragging, dragStart, zoom, widthScale, heightScale, getBoundedPosition]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
    // Snap to 1 if close
    if (Math.abs(newWidth - 1) < 0.05) {
      finalWidth = 1;
    }
    setWidthScale(finalWidth);
    setPosition(pos => getBoundedPosition(pos.x, pos.y, zoom, finalWidth, heightScale));
  };
    
  const handleHeightChange = (newHeight: number) => {
    let finalHeight = newHeight;
     // Snap to 1 if close
    if (Math.abs(newHeight - 1) < 0.05) {
      finalHeight = 1;
    }
    setHeightScale(finalHeight);
    setPosition(pos => getBoundedPosition(pos.x, pos.y, zoom, widthScale, finalHeight));
  };
  
  const handleSave = () => {
    const image = imageRef.current;
    const cropBox = cropBoxRef.current;
    const renderedImage = renderedImageRef.current;
    
    if (!image || !cropBox || !renderedImage) return;

    const renderedImageRect = renderedImage.getBoundingClientRect();
    if (renderedImageRect.width === 0 || renderedImageRect.height === 0) return;

    const scaleRatioX = image.naturalWidth / renderedImageRect.width;
    const scaleRatioY = image.naturalHeight / renderedImageRect.height;
    
    const cropBoxRect = cropBox.getBoundingClientRect();
    
    // Calculate the top-left of the source rectangle for cropping
    const sourceX = (cropBoxRect.left - renderedImageRect.left) * scaleRatioX;
    const sourceY = (cropBoxRect.top - renderedImageRect.top) * scaleRatioY;
    const sourceWidth = cropBoxRect.width * scaleRatioX;
    const sourceHeight = cropBoxRect.height * scaleRatioY;

    const outputCanvas = document.createElement('canvas');
    // Set canvas size, respecting a max width of 1080px for standard posts
    const outputWidth = Math.min(sourceWidth, 1080);
    const outputHeight = outputWidth / aspectRatio;
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );
    onSave(outputCanvas.toDataURL('image/jpeg', 0.92));
  };
  
  const isPortraitOrSquare = aspectRatio <= 1;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recortar Imagem</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Arraste para mover e use os controles para ajustar. Proporção: {getAspectRatioLabel()}.</p>
        </div>
        
        <div 
          ref={containerRef}
          className="flex-grow p-4 flex justify-center items-center bg-gray-200 dark:bg-gray-800 relative overflow-hidden select-none"
        >
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
              <img
                ref={renderedImageRef}
                src={imageSrc}
                alt="Aguardando imagem..."
                className="pointer-events-none w-full h-full object-cover"
              />
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
              {/* Grid lines */}
              <div className="absolute top-0 left-1/3 w-px h-full bg-white/40"></div>
              <div className="absolute top-0 left-2/3 w-px h-full bg-white/40"></div>
              <div className="absolute top-1/3 left-0 w-full h-px bg-white/40"></div>
              <div className="absolute top-2/3 left-0 w-full h-px bg-white/40"></div>
            </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
           <div className="flex-grow w-full space-y-2">
                <div className="flex items-center gap-2">
                    <label htmlFor="zoom-slider" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">Zoom</label>
                    <input
                        id="zoom-slider"
                        type="range"
                        min={initialState.zoom}
                        max={initialState.zoom * 4}
                        step="0.01"
                        value={zoom}
                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                      <label htmlFor="width-slider" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">H</label>
                      <input
                          id="width-slider"
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.01"
                          value={widthScale}
                          onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
                          className="w-full"
                          style={{ '--thumb-color': widthScale === 1 ? '#4e87b8' : '#a1a1aa' } as React.CSSProperties}
                      />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                      <label htmlFor="height-slider" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">V</label>
                       <input
                          id="height-slider"
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.01"
                          value={heightScale}
                          onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                          className="w-full"
                          style={{ '--thumb-color': heightScale === 1 ? '#4e87b8' : '#a1a1aa' } as React.CSSProperties}
                      />
                  </div>
                </div>
            </div>
             <div className="flex justify-end gap-4 w-full sm:w-auto flex-shrink-0">
              <button onClick={() => { setZoom(initialState.zoom); setWidthScale(1); setHeightScale(1); setPosition(initialState.position); }} className="py-2 px-4 text-sm bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Restaurar
              </button>
              <button onClick={handleSave} className="py-2 px-4 text-sm bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                Salvar Recorte
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default ImageCropper;

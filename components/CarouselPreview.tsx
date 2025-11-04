import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';

interface CarouselPreviewProps {
  media: MediaItem[];
  aspectRatio: number;
  onEdit: (item: MediaItem) => void;
  onRemove: (id: string) => void;
}

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ media, aspectRatio, onEdit, onRemove }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= media.length && media.length > 0) {
      setCurrentIndex(media.length - 1);
    } else if (media.length === 0) {
      setCurrentIndex(0);
    }
  }, [media, currentIndex]);

  if (media.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? media.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === media.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const currentMedia = media[currentIndex];

  return (
    <div className="flex-grow flex flex-col gap-2 min-h-0">
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center items-center relative overflow-hidden group min-h-0"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        {currentMedia.type.startsWith('image/') ? (
          <img src={currentMedia.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
          <video src={currentMedia.url} controls className="max-w-full max-h-full object-contain rounded-md" />
        )}

        {currentMedia.needsCrop && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-70 flex flex-col justify-center items-center text-white text-center p-4 rounded-md pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="font-bold">Recorte Necessário</p>
            <p className="text-sm">A proporção desta imagem não corresponde ao formato.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 z-10 flex gap-2">
             <button type="button" onClick={() => onEdit(currentMedia)} className="bg-brand-primary text-white font-bold py-1 px-3 rounded-full text-sm hover:bg-brand-secondary transition shadow-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                Editar
            </button>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(currentMedia.id); }} className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 text-white rounded-full p-1.5 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button type="button" onClick={goToPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition opacity-0 group-hover:opacity-100 focus:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
            <button type="button" onClick={goToNext} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition opacity-0 group-hover:opacity-100 focus:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {media.length > 1 && (
        <div className="flex justify-center p-2">
          {media.map((_, slideIndex) => (
            <button
              type="button"
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-600 hover:bg-brand-secondary/50'}`}
              aria-label={`Ir para a mídia ${slideIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselPreview;
import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { PlatformIcons } from './PlatformIcons';
import CarouselPreview from './CarouselPreview';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onClone: (post: Post) => void;
  onDelete: (id: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onEdit, onClone, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPast = new Date(post.scheduledAt) < new Date();
  // FIX: Add state to manage the current index for the carousel.
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detalhes do Post</h2>
          <div className="flex items-center gap-2">
             <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition"
                aria-label="Opções do post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-dark-card shadow-lg rounded-md z-20 border dark:border-dark-border">
                   <button
                    onClick={() => { onEdit(post); setIsMenuOpen(false); }}
                    disabled={isPast}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    Editar
                  </button>
                   <button
                    onClick={() => { onClone(post); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>
                    Clonar
                  </button>
                  <div className="border-t my-1 border-gray-200 dark:border-dark-border"></div>
                   <button
                    onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(post.id);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    Excluir
                  </button>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
                 <CarouselPreview 
                    media={post.media}
                    aspectRatio={post.media.length > 0 ? post.media[0].aspectRatio : 1}
                    onEdit={() => onEdit(post)} // Clicking edit on carousel in view mode should open the main editor
                    onRemove={() => {}} // Remove is disabled in view-only mode
                    currentIndex={currentMediaIndex}
                    onCurrentIndexChange={setCurrentMediaIndex}
                />
            </div>
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">AGENDADO PARA</h3>
                    <p className="text-lg text-gray-800 dark:text-gray-100">{new Date(post.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">PLATAFORMAS</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {post.platforms.map(p => (
                             <div key={p} className="flex items-center gap-2 py-1 px-3 rounded-full bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-200">
                                {PlatformIcons[p]}
                                <span className="text-sm font-medium">{p}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">CONTEÚDO</h3>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg max-h-60 overflow-y-auto">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                            {post.content || <span className="italic text-gray-500">Nenhum texto para este post.</span>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

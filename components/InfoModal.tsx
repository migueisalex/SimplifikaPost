import React, { useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, isLoading, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run the accordion logic if this is the Help modal
    if (isOpen && !isLoading && contentRef.current && title === 'Central de Ajuda') {
      const container = contentRef.current;
      // Fix: Explicitly cast the result of `querySelectorAll` to an `HTMLElement` array
      // to resolve type errors where properties on DOM elements were not accessible.
      const buttons = Array.from(container.querySelectorAll('.accordion-button')) as HTMLElement[];

      const handleClick = (event: MouseEvent) => {
        const button = event.currentTarget as HTMLElement;
        const content = button.nextElementSibling as HTMLElement;
        if (!content) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Close all other accordions
        buttons.forEach(otherButton => {
          if (otherButton !== button) {
            otherButton.setAttribute('aria-expanded', 'false');
            const otherContent = otherButton.nextElementSibling as HTMLElement;
            if (otherContent) {
              otherContent.style.maxHeight = '0';
              otherContent.classList.remove('open');
            }
          }
        });

        // Toggle the clicked accordion
        button.setAttribute('aria-expanded', String(!isExpanded));
        if (isExpanded) {
          content.style.maxHeight = '0';
          content.classList.remove('open');
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.classList.add('open');
        }
      };

      buttons.forEach(button => {
        button.addEventListener('click', handleClick);
      });

      // Cleanup function to remove event listeners when the modal closes or content changes
      return () => {
        buttons.forEach(button => {
          button.removeEventListener('click', handleClick);
        });
      };
    }
  }, [isOpen, isLoading, title, children]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[80] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center sticky top-0 bg-white dark:bg-dark-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto text-gray-700 dark:text-gray-300">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <div ref={contentRef} className="prose dark:prose-invert max-w-none">
                {children}
            </div>
          )}
        </div>
        <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button onClick={onClose} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
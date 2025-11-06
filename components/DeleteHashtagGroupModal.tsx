import React from 'react';
import { HashtagGroup } from '../types';

interface DeleteHashtagGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  hashtagGroups: HashtagGroup[];
  onDelete: (groupId: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const DeleteHashtagGroupModal: React.FC<DeleteHashtagGroupModalProps> = ({ isOpen, onClose, hashtagGroups, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Excluir Grupos de Hashtags</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {hashtagGroups.length > 0 ? (
            <ul className="space-y-2">
              {hashtagGroups.map(group => (
                <li key={group.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{group.name}</span>
                  <button
                    onClick={() => onDelete(group.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    title={`Excluir "${group.name}"`}
                    aria-label={`Excluir grupo ${group.name}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum grupo de hashtags para excluir.</p>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHashtagGroupModal;

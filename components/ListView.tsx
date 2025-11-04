import React from 'react';
import { Post, PostType } from '../types';
import { PlatformIcons } from './PlatformIcons';

interface ListViewProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'scheduled' | 'published') => void;
  onClone: (post: Post) => void;
}

const PostCard: React.FC<{post: Post, onEdit: (post: Post) => void, onDelete: (id: string) => void, onStatusChange: (id: string, status: 'scheduled' | 'published') => void, onClone: (post: Post) => void}> = ({ post, onEdit, onDelete, onStatusChange, onClone }) => {
    const isUpcoming = new Date(post.scheduledAt) > new Date();
    const isPast = !isUpcoming;
    const firstMedia = post.media[0];

    return (
        <div className={`bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${post.status === 'published' ? 'opacity-60' : ''}`}>
            <div className="p-5 flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-48 flex-shrink-0 relative">
                    {firstMedia ? (
                        firstMedia.type.startsWith('image/') ? (
                            <img src={firstMedia.url} alt="Post media" className="rounded-lg w-full h-40 object-cover" />
                        ) : (
                            <video src={firstMedia.url} controls className="rounded-lg w-full h-40 object-cover" />
                        )
                    ) : (
                        <div className="rounded-lg w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500">Sem mídia</span>
                        </div>
                    )}
                    {post.media.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                             <span>{post.media.length}</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(post.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                           <div className="flex items-center gap-2 mt-1">
                             <div className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                                post.status === 'published' ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : isUpcoming ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                                {post.status === 'published' ? 'Publicado' : isUpcoming ? 'Agendado' : 'Atrasado'}
                            </div>
                             <div className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full inline-block bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                {post.postType}
                            </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                            {post.platforms.map(p => <span key={p} title={p}>{PlatformIcons[p]}</span>)}
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                        {post.content}
                    </p>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-dark-card/50 px-5 py-3 flex flex-col sm:flex-row justify-end items-center gap-3">
                 <button 
                    onClick={() => onStatusChange(post.id, post.status === 'scheduled' ? 'published' : 'scheduled')}
                    disabled={isPast}
                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-secondary transition w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600"
                 >
                    {post.status === 'scheduled' ? 'Marcar como Publicado' : 'Marcar como Agendado'}
                 </button>
                 <div className="flex gap-3 w-full sm:w-auto">
                    {isPast ? (
                       <button onClick={() => onClone(post)} className="w-full sm:w-auto py-2 px-4 text-sm font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Clonar Post</button>
                    ) : (
                      <>
                        <button onClick={() => onEdit(post)} className="w-full sm:w-auto py-2 px-4 text-sm font-bold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Editar</button>
                        <button onClick={() => onDelete(post.id)} className="w-full sm:w-auto py-2 px-4 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Excluir</button>
                      </>
                    )}
                </div>
            </div>
        </div>
    )
}


const ListView: React.FC<ListViewProps> = ({ posts, onEdit, onDelete, onStatusChange, onClone }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white dark:bg-dark-card rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Nenhum post agendado ainda.</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Clique em "Novo Post" para começar a planejar seu conteúdo!</p>
      </div>
    );
  }
  
  const upcomingPosts = posts.filter(p => p.status === 'scheduled');
  const publishedPosts = posts.filter(p => p.status === 'published');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-brand-primary pb-2">Agendados</h2>
        {upcomingPosts.length > 0 ? (
          <div className="space-y-4">
            {upcomingPosts.map(post => <PostCard key={post.id} post={post} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onClone={onClone} />)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">Nenhum post na fila de agendamento.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-gray-300 dark:border-dark-border pb-2">Histórico de Publicações</h2>
        {publishedPosts.length > 0 ? (
          <div className="space-y-4">
            {publishedPosts.map(post => <PostCard key={post.id} post={post} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} onClone={onClone} />)}
          </div>
        ) : (
           <p className="text-gray-500 dark:text-gray-400 italic">Nenhum post foi marcado como publicado.</p>
        )}
      </div>
    </div>
  );
};

export default ListView;
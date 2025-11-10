import { useState, Dispatch, SetStateAction, useCallback } from 'react';
import { Post } from '../types';

const SIXTY_DAYS_IN_MS = 60 * 24 * 60 * 60 * 1000;

const cleanupOldPosts = (posts: Post[]): Post[] => {
    const now = new Date();
    return posts.filter(post => {
        if (post.status !== 'published') {
            return true; // Manter todos os posts que não foram publicados
        }
        const postDate = new Date(post.scheduledAt);
        const ageInMs = now.getTime() - postDate.getTime();
        
        // Retorna false para filtrar (remover) posts com mais de 60 dias
        return ageInMs <= SIXTY_DAYS_IN_MS;
    });
};

function usePostsStorage(key: string, initialValue: Post[]): [Post[], Dispatch<SetStateAction<Post[]>>] {
    const [posts, setPostsInternal] = useState<Post[]>(() => {
        try {
            const item = window.localStorage.getItem(key);
            const loadedPosts = item ? JSON.parse(item) : initialValue;
            
            const cleanedPosts = cleanupOldPosts(loadedPosts);

            // Se a limpeza ocorreu no carregamento, atualize o localStorage imediatamente
            if (loadedPosts.length > cleanedPosts.length) {
                console.log(`Removidos ${loadedPosts.length - cleanedPosts.length} posts antigos publicados na inicialização.`);
                window.localStorage.setItem(key, JSON.stringify(cleanedPosts));
            }
            return cleanedPosts;
        } catch (error) {
            console.error("Erro ao carregar posts do localStorage:", error);
            return initialValue;
        }
    });

    const setPosts = useCallback((value: Post[] | ((val: Post[]) => Post[])) => {
        setPostsInternal(currentPosts => {
            const postsToStore = value instanceof Function ? value(currentPosts) : value;
            const cleanedPosts = cleanupOldPosts(postsToStore);

            if (postsToStore.length > cleanedPosts.length) {
                console.log(`Removidos ${postsToStore.length - cleanedPosts.length} posts antigos publicados ao salvar.`);
            }
            
            try {
                window.localStorage.setItem(key, JSON.stringify(cleanedPosts));
            } catch (error) {
                console.error("Falha ao salvar posts no localStorage:", error);
                // Não atualize o estado se o armazenamento falhar, para evitar inconsistência de dados
                alert("Ocorreu um erro ao salvar suas postagens. O armazenamento pode estar cheio.");
                return currentPosts; 
            }
            return cleanedPosts;
        });
    // Fix: Added setPostsInternal to the dependency array as it's used within the callback.
    }, [key, setPostsInternal]);

    return [posts, setPosts as Dispatch<SetStateAction<Post[]>>];
}

export default usePostsStorage;
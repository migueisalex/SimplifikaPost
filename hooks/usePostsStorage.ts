import { useState, Dispatch, SetStateAction } from 'react';
import { Post } from '../types';

const NINETY_DAYS_IN_MS = 90 * 24 * 60 * 60 * 1000;

const cleanupOldPosts = (posts: Post[]): Post[] => {
    const now = new Date();

    return posts.filter(post => {
        // Regra 1: Manter sempre todos os posts que ainda não foram publicados.
        if (post.status === 'scheduled') {
            return true;
        }

        // Regra 2: Para posts publicados, verificar a idade.
        const postDate = new Date(post.scheduledAt);
        const ageInMs = now.getTime() - postDate.getTime();

        // Se o post foi publicado há mais de 90 dias, remove-o completamente (com mídia e tudo).
        if (ageInMs > NINETY_DAYS_IN_MS) {
            return false;
        }

        // Mantém o post publicado se tiver menos de 90 dias, com toda a sua mídia.
        return true;
    });
};


function usePostsStorage(key: string, initialValue: Post[]): [Post[], Dispatch<SetStateAction<Post[]>>] {
    const [posts, setPostsInternal] = useState<Post[]>(() => {
        try {
            const item = window.localStorage.getItem(key);
            const loadedPosts = item ? JSON.parse(item) : initialValue;
            
            const cleanedPosts = cleanupOldPosts(loadedPosts);

            if (loadedPosts.length !== cleanedPosts.length) {
                console.log(`Posts otimizados no carregamento inicial.`);
                window.localStorage.setItem(key, JSON.stringify(cleanedPosts));
            }
            return cleanedPosts;
        } catch (error) {
            console.error("Erro ao carregar posts do localStorage:", error);
            return initialValue;
        }
    });

    const setPosts = (value: Post[] | ((val: Post[]) => Post[])) => {
        setPostsInternal(currentPosts => {
            const postsToStore = value instanceof Function ? value(currentPosts) : value;
            const cleanedPosts = cleanupOldPosts(postsToStore); // Sempre otimiza antes de salvar

            try {
                window.localStorage.setItem(key, JSON.stringify(cleanedPosts));
            } catch (error) {
                console.error("Falha ao salvar posts no localStorage:", error);
                alert("Ocorreu um erro ao salvar sua postagem. O armazenamento do navegador pode estar cheio. Para liberar espaço, o aplicativo otimiza posts mais antigos. Se o erro persistir, tente remover posts com muitas imagens ou vídeos.");
                return currentPosts; // Aborta a atualização do estado em caso de falha
            }
            return cleanedPosts;
        });
    };

    return [posts, setPosts as Dispatch<SetStateAction<Post[]>>];
}

export default usePostsStorage;
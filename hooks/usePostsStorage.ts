import { useState, Dispatch, SetStateAction } from 'react';
import { Post } from '../types';

const MAX_PUBLISHED_POSTS_WITH_MEDIA = 10;
const NINETY_DAYS_IN_MS = 90 * 24 * 60 * 60 * 1000;

const cleanupOldPosts = (posts: Post[]): Post[] => {
    const now = new Date();

    // Separa os posts por status
    const scheduledPosts = posts.filter(p => p.status !== 'published');
    const publishedPosts = posts.filter(p => p.status === 'published');

    // Ordena os posts publicados por data, do mais recente para o mais antigo
    publishedPosts.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const cleanedPublishedPosts = publishedPosts.map((post, index) => {
        const postDate = new Date(post.scheduledAt);
        const ageInMs = now.getTime() - postDate.getTime();

        // Regra 1: Remove o post completamente se for muito antigo (ex: > 90 dias)
        if (ageInMs > NINETY_DAYS_IN_MS) {
            return null; // Será filtrado posteriormente
        }

        // Regra 2: Para posts que não serão deletados, verifica se devemos remover a mídia
        // Mantemos a mídia para os N posts publicados mais recentes.
        if (index >= MAX_PUBLISHED_POSTS_WITH_MEDIA && post.media.length > 0) {
            // Cria uma cópia do post e limpa sua mídia para economizar espaço
            return { ...post, media: [] };
        }

        // Mantém o post como está (é recente o suficiente para manter a mídia)
        return post;
    }).filter((p): p is Post => p !== null); // Filtra os posts nulos (deletados)

    // Combina os posts agendados com os posts publicados já limpos
    return [...scheduledPosts, ...cleanedPublishedPosts];
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
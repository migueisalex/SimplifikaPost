import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { Post } from '../types';

const getInitialPosts = (): Post[] => {
    const storedPosts = localStorage.getItem('social-scheduler-posts');
    if (storedPosts) {
        return JSON.parse(storedPosts).map((post: Post) => ({
            ...post,
            scheduleDate: new Date(post.scheduleDate),
        }));
    }
    return [];
};

export const usePostsStorage = () => {
    const [posts, setPosts] = useLocalStorage<Post[]>('social-scheduler-posts', getInitialPosts());

    const addPost = useCallback((post: Post) => {
        setPosts(prev => [...prev, post]);
    }, [setPosts]);

    const updatePost = useCallback((updatedPost: Post) => {
        setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
    }, [setPosts]);

    const deletePost = useCallback((postId: string) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    }, [setPosts]);

    // Save to localStorage whenever posts change
    useEffect(() => {
        localStorage.setItem('social-scheduler-posts', JSON.stringify(posts));
    }, [posts]);

    return {
        posts,
        addPost,
        updatePost,
        deletePost,
    };
};

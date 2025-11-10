import { useState, useCallback, useMemo } from 'react';
import { Subscription } from '../types';

const MAX_IMAGE_GENERATIONS = 60;
const MAX_TEXT_GENERATIONS = 100; // Arbitrary limit for non-image AI features

export interface UsageTracker {
    imageGenerations: number;
    textGenerations: number;
    canGenerateImage: boolean;
    canGenerateText: boolean;
    isUpgradeModalOpen: boolean;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;
    incrementImageGeneration: () => void;
    incrementTextGeneration: () => void;
}

export const useUsageTracker = (subscription: Subscription | null): UsageTracker => {
    // Mock state for usage count - in a real app, this would come from the backend
    const [imageGenerations, setImageGenerations] = useState(15); 
    const [textGenerations, setTextGenerations] = useState(50);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const canGenerateImage = useMemo(() => {
        if (!subscription) return false;
        if (subscription.hasAiAddon) {
            return imageGenerations < MAX_IMAGE_GENERATIONS;
        }
        return false;
    }, [subscription, imageGenerations]);

    const canGenerateText = useMemo(() => {
        if (!subscription) return false;
        // Text generation is included in all paid packages (1, 2, 3)
        if (subscription.package > 0) {
            return textGenerations < MAX_TEXT_GENERATIONS;
        }
        return false;
    }, [subscription, textGenerations]);

    const openUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(true);
    }, []);

    const closeUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(false);
    }, []);

    const incrementImageGeneration = useCallback(() => {
        if (canGenerateImage) {
            setImageGenerations(prev => prev + 1);
        }
    }, [canGenerateImage]);

    const incrementTextGeneration = useCallback(() => {
        if (canGenerateText) {
            setTextGenerations(prev => prev + 1);
        }
    }, [canGenerateText]);

    return {
        imageGenerations,
        textGenerations,
        canGenerateImage,
        canGenerateText,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        incrementImageGeneration,
        incrementTextGeneration,
    };
};

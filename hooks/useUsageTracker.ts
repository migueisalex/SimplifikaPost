import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { Subscription } from '../types';

export const POST_LIMIT_FREEMIUM = 5;
export const IMAGE_LIMIT_FREEMIUM = 2;
export const AI_TEXT_LIMIT_FREEMIUM = 20;


export interface UsageData {
  lastReset: string; // YYYY-MM
  postsThisMonth: number;
  imageGenerationsThisMonth: number;
  aiTextGenerationsThisMonth: number;
}

const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
}

const getInitialUsage = (): UsageData => ({
    lastReset: new Date().toISOString().slice(0, 7), // YYYY-MM
    postsThisMonth: 0,
    imageGenerationsThisMonth: 0,
    aiTextGenerationsThisMonth: 0,
});

export const useUsageTracker = (subscription: Subscription | null) => {
    const [usage, setUsage] = useLocalStorage<UsageData>('social-scheduler-usage', getInitialUsage());

    useEffect(() => {
        const oldUsage = usage as any;
        if (oldUsage.lastAiReset || oldUsage.lastPostReset) {
            console.log("Migrating usage data to new monthly structure.");
            const today = new Date();
            const todayMonthStr = today.toISOString().slice(0, 7);
            const lastPostResetMonthStr = oldUsage.lastPostReset || todayMonthStr;

            const newUsage: UsageData = {
                lastReset: lastPostResetMonthStr,
                postsThisMonth: lastPostResetMonthStr === todayMonthStr ? (oldUsage.postsThisMonth || 0) : 0,
                imageGenerationsThisMonth: lastPostResetMonthStr === todayMonthStr ? (oldUsage.imageGenerationsThisMonth || 0) : 0,
                aiTextGenerationsThisMonth: 0, // Resets AI text count as it was daily
            };
            setUsage(newUsage);
            return;
        }

        const today = new Date();
        const [year, month] = usage.lastReset.split('-').map(Number);
        const lastResetDate = new Date(year, month - 1);

        if (!isSameMonth(lastResetDate, today)) {
            setUsage(getInitialUsage());
        }
    }, [usage, setUsage]);

    const isFreemiumPlan = !subscription || subscription.package === 0;
    const isProPlan = subscription?.package === 4;

    const canCreatePost = isFreemiumPlan ? usage.postsThisMonth < POST_LIMIT_FREEMIUM : true;
    const canGenerateText = isFreemiumPlan ? usage.aiTextGenerationsThisMonth < AI_TEXT_LIMIT_FREEMIUM : true;
    const canGenerateImages = isProPlan || (isFreemiumPlan ? usage.imageGenerationsThisMonth < IMAGE_LIMIT_FREEMIUM : (subscription?.hasAiAddon ?? false));

    const incrementPostCount = useCallback(() => {
        if (isFreemiumPlan) {
            setUsage(prev => ({...prev, postsThisMonth: prev.postsThisMonth + 1}));
        }
    }, [isFreemiumPlan, setUsage]);

    const incrementAiGenerationCount = useCallback(() => {
        if (isFreemiumPlan) {
            setUsage(prev => ({...prev, aiTextGenerationsThisMonth: prev.aiTextGenerationsThisMonth + 1}));
        }
    }, [isFreemiumPlan, setUsage]);

    const incrementImageGenerationCount = useCallback(() => {
        if (isFreemiumPlan) {
            setUsage(prev => ({...prev, imageGenerationsThisMonth: prev.imageGenerationsThisMonth + 1}));
        }
    }, [isFreemiumPlan, setUsage]);

    return {
        canCreatePost,
        canGenerateText,
        canGenerateImages,
        incrementPostCount,
        incrementAiGenerationCount,
        incrementImageGenerationCount,
        isFreemiumPlan,
        usage,
    };
};

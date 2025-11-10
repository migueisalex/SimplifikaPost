import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { Subscription } from '../types';

export const AI_GENERATION_LIMIT_TESTER = 4;
export const POST_LIMIT_TESTER = 5;

interface UsageData {
  lastAiReset: string; // ISO date string
  aiGenerationsToday: number;
  lastPostReset: string; // ISO date string YYYY-MM
  postsThisMonth: number;
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
}

const getInitialUsage = (): UsageData => ({
    lastAiReset: new Date().toISOString(),
    aiGenerationsToday: 0,
    lastPostReset: new Date().toISOString().slice(0, 7), // YYYY-MM
    postsThisMonth: 0,
});

export const useUsageTracker = (subscription: Subscription | null) => {
    const [usage, setUsage] = useLocalStorage<UsageData>('social-scheduler-usage', getInitialUsage());

    useEffect(() => {
        const today = new Date();
        const lastAiDate = new Date(usage.lastAiReset);

        // Safely parse YYYY-MM from lastPostReset
        const [year, month] = usage.lastPostReset.split('-').map(Number);
        const lastPostDate = new Date(year, month - 1);

        let needsUpdate = false;
        const newUsage = { ...usage };

        if (!isSameDay(lastAiDate, today)) {
            newUsage.aiGenerationsToday = 0;
            newUsage.lastAiReset = today.toISOString();
            needsUpdate = true;
        }

        if (!isSameMonth(lastPostDate, today)) {
            newUsage.postsThisMonth = 0;
            newUsage.lastPostReset = today.toISOString().slice(0, 7);
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            setUsage(newUsage);
        }
    }, [usage, setUsage]);

    const isTesterPlan = !subscription || subscription.package === 0;

    const canCreatePost = isTesterPlan ? usage.postsThisMonth < POST_LIMIT_TESTER : true;
    const canGenerateText = isTesterPlan ? usage.aiGenerationsToday < AI_GENERATION_LIMIT_TESTER : true;

    const incrementPostCount = useCallback(() => {
        if (isTesterPlan) {
            setUsage(prev => ({...prev, postsThisMonth: prev.postsThisMonth + 1}));
        }
    }, [isTesterPlan, setUsage]);

    const incrementAiGenerationCount = useCallback(() => {
        if (isTesterPlan) {
            setUsage(prev => ({...prev, aiGenerationsToday: prev.aiGenerationsToday + 1}));
        }
    }, [isTesterPlan, setUsage]);

    return {
        canCreatePost,
        canGenerateText,
        incrementPostCount,
        incrementAiGenerationCount,
        isTesterPlan,
    };
};

'use server';

import { getContextualInformation, type ContextualInformationInput } from '@/ai/flows/contextual-information-tool';
import { submitFeedbackFlow } from '@/ai/flows/feedback-flow';
import type { FeedbackInput } from '@/lib/types';

export async function getAIInsights(input: ContextualInformationInput) {
    try {
        const result = await getContextualInformation(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting AI insights:", error);
        return { success: false, error: "Failed to get AI insights. Please try again." };
    }
}

export async function submitFeedback(input: FeedbackInput) {
    try {
        await submitFeedbackFlow(input);
        return { success: true };
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return { success: false, error: "Failed to submit feedback. Please try again." };
    }
}

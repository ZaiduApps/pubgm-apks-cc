'use server';

import type { FeedbackInput } from '@/lib/types';

type ContextualInformationInput = {
  content: string;
};

export async function getAIInsights(input: ContextualInformationInput) {
  try {
    const { getContextualInformation } = await import(
      '@/ai/flows/contextual-information-tool'
    );
    const result = await getContextualInformation(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return { success: false, error: 'Failed to get AI insights. Please try again.' };
  }
}

export async function submitFeedback(input: FeedbackInput) {
  try {
    const { submitFeedbackFlow } = await import('@/ai/flows/feedback-flow');
    await submitFeedbackFlow(input);
    return { success: true };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback. Please try again.' };
  }
}

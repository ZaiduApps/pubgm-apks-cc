'use server';

import type { FeedbackInput } from '@/lib/types';

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

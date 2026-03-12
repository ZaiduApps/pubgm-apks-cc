'use server';
/**
 * @fileOverview 处理用户反馈。
 */

import { ai } from '@/ai/genkit';
import { FeedbackInputSchema, type FeedbackInput } from '@/lib/types';

const modelName = process.env.GENERATIVE_AI_MODEL || 'googleai/gemini-pro';

export async function submitFeedbackFlow(input: FeedbackInput) {
  // 目前先记录并生成确认消息，后续可接数据库或通知系统。
  console.log('收到新的反馈：', input);

  const { output } = await ai.generate({
    prompt: `用户提交了以下网站反馈：\n标题: ${input.title}\n内容: ${input.content}\n联系方式: ${input.contact || '未提供'}\n\n请生成一条简短中文确认消息。`,
    model: modelName,
  });

  return {
    status: 'received',
    message: output ?? '感谢你的反馈，我们已收到。',
  };
}

ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: FeedbackInputSchema,
  },
  submitFeedbackFlow
);

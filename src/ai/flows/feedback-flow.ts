
'use server';
/**
 * @fileOverview 一个用于处理用户反馈的AI流程。
 *
 * - submitFeedbackFlow - 接收并处理用户提交的反馈。
 */

import { ai } from '@/ai/genkit';
import { FeedbackInputSchema, type FeedbackInput } from '@/lib/types';

const modelName = process.env.GENERATIVE_AI_MODEL || 'googleai/gemini-pro';

export async function submitFeedbackFlow(input: FeedbackInput) {
  // 在真实的应用程序中，您可能会将此反馈保存到数据库，
  // 或者触发一个工作流程（例如发送邮件给支持团队）。
  // 这里，我们只在服务器日志中记录它。
  console.log('收到了新的反馈:', input);

  // 此流程还可以调用另一个LLM来分类反馈、提取实体等。
  // 为简单起见，我们直接返回一个确认。
  
  const { output } = await ai.generate({
    prompt: `一名用户提交了以下网站反馈。\n标题: ${input.title}\n内容: ${input.content}\n联系方式: ${input.contact || '未提供'}\n\n请生成一条简短的中文确认消息，感谢他们的提交。`,
    model: modelName,
  });


  return {
    status: 'received',
    message: output ?? '感谢您的反馈！',
  };
}

const flow = ai.defineFlow(
    {
      name: 'submitFeedbackFlow',
      inputSchema: FeedbackInputSchema,
    },
    submitFeedbackFlow
);

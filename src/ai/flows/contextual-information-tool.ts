'use server';
/**
 * @fileOverview 根据文章内容返回 AI 策略提示。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContextualInformationInputSchema = z.object({
  content: z.string().describe('当前文章或帖子内容'),
});
export type ContextualInformationInput = z.infer<typeof ContextualInformationInputSchema>;

const ContextualInformationOutputSchema = z.object({
  suggestions: z.array(z.string().describe('基于内容给出的策略建议')).describe('建议列表'),
});
export type ContextualInformationOutput = z.infer<typeof ContextualInformationOutputSchema>;

export async function getContextualInformation(
  input: ContextualInformationInput
): Promise<ContextualInformationOutput> {
  return contextualInformationFlow(input);
}

const modelName = process.env.GENERATIVE_AI_MODEL || 'googleai/gemini-pro';

const prompt = ai.definePrompt({
  name: 'contextualInformationPrompt',
  input: { schema: ContextualInformationInputSchema },
  output: { schema: ContextualInformationOutputSchema },
  model: modelName,
  prompt: `你是一名 PUBG Mobile 助手，请根据给定内容提供可操作的策略建议。

内容：{{{content}}}

要求：
1. 输出 5 条以内建议。
2. 建议要具体、可执行。
3. 全部使用中文。`,
});

const contextualInformationFlow = ai.defineFlow(
  {
    name: 'contextualInformationFlow',
    inputSchema: ContextualInformationInputSchema,
    outputSchema: ContextualInformationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

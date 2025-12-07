
'use server';
/**
 * @fileOverview 一个AI代理，根据正在查看的内容提供上下文信息。
 *
 * - getContextualInformation - 处理提供上下文信息过程的函数。
 * - ContextualInformationInput - getContextualInformation 函数的输入类型。
 * - ContextualInformationOutput - getContextualInformation 函数的返回类型。
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualInformationInputSchema = z.object({
  content: z.string().describe('正在查看的文章或论坛帖子的内容。'),
});
export type ContextualInformationInput = z.infer<typeof ContextualInformationInputSchema>;

const ContextualInformationOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('基于内容提供相关的提示、策略或分析。')
  ).describe('一个建议列表，旨在提高游戏玩法和对游戏的理解。'),
});
export type ContextualInformationOutput = z.infer<typeof ContextualInformationOutputSchema>;

export async function getContextualInformation(input: ContextualInformationInput): Promise<ContextualInformationOutput> {
  return contextualInformationFlow(input);
}

const modelName = process.env.GENERATIVE_AI_MODEL || 'googleai/gemini-pro';

const prompt = ai.definePrompt({
  name: 'contextualInformationPrompt',
  input: {schema: ContextualInformationInputSchema},
  output: {schema: ContextualInformationOutputSchema},
  model: modelName,
  prompt: `你是一名AI助手，旨在为《PUBG Mobile》玩家提供相关的游戏技巧、策略和分析。

  请分析以下内容，并提供一个建议列表，以提高用户的游戏水平和对游戏的理解。建议应侧重于可操作的建议和见解。

  内容: {{{content}}}

  建议应简洁，并与所提供的内容直接相关。将建议数量限制为3条。
  所有建议都必须使用中文。
  `,
});

const contextualInformationFlow = ai.defineFlow(
  {
    name: 'contextualInformationFlow',
    inputSchema: ContextualInformationInputSchema,
    outputSchema: ContextualInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

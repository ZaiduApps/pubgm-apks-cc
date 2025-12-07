import { z } from 'zod';

export const FeedbackInputSchema = z.object({
  title: z.string().min(1, '反馈标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(10, '反馈内容不能少于10个字符').max(1000, '内容不能超过1000个字符'),
  contact: z.string().optional(),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export const FeedbackOutputSchema = z.object({
  status: z.string(),
  message: z.string(),
});
export type FeedbackOutput = z.infer<typeof FeedbackOutputSchema>;

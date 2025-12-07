
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';
import { submitFeedback } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { FeedbackInput, FeedbackInputSchema } from '@/lib/types';


export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(FeedbackInputSchema),
    defaultValues: {
      title: '',
      content: '',
      contact: '',
    },
  });

  const onSubmit = async (data: FeedbackInput) => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(data);
      if (result.success) {
        toast({
          title: '反馈已提交',
          description: '感谢您的宝贵意见！',
        });
        setIsOpen(false);
        form.reset();
      } else {
        throw new Error(result.error || '提交失败');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '提交出错',
        description: error instanceof Error ? error.message : '未能提交您的反馈，请稍后再试。',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">
          {siteConfig.footer.feedback.buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{siteConfig.footer.feedback.dialogTitle}</DialogTitle>
          <DialogDescription>{siteConfig.footer.feedback.dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>反馈标题</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：网站样式建议或内容错误" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>详细内容</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请详细描述您的问题或建议..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>您的联系方式 (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="邮箱或电话，方便我们与您联系" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        取消
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                提交反馈
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

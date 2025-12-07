
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, Lightbulb, Loader2 } from 'lucide-react';
import { getAIInsights } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ContextualInfoProps {
  content: string;
}

export function ContextualInfo({ content }: ContextualInfoProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const result = await getAIInsights({ content });

    if (result.success && result.data?.suggestions) {
      setSuggestions(result.data.suggestions);
    } else {
      setError(result.error || '发生未知错误。');
    }
    setIsLoading(false);
  };

  return (
    <Card className="mt-12 mb-8 bg-card/50 border-accent/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center">
          <Bot className="mr-2 h-5 w-5 text-accent" />
          AI 智能提示
        </CardTitle>
        <Button onClick={handleGetInsights} disabled={isLoading} variant="secondary">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              分析中...
            </>
          ) : (
            '获取技巧'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <p className="text-sm text-muted-foreground">AI 正在分析内容以提供战略技巧...</p>
        ) : error ? (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-3 mt-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="h-5 w-5 mr-3 mt-1 text-accent shrink-0" />
                <span className="text-muted-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">点击“获取技巧”以接收基于本文的 AI 策略和分析。</p>
        )}
      </CardContent>
    </Card>
  );
}

    
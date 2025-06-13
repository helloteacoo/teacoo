"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import QuestionFormModal from './QuestionFormModal';
import { toast } from 'sonner';
import type { Question, QuestionType } from '../../types/question';
import type { SingleQuestionType, GroupQuestionType } from './QuestionFormModal';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface AIconvertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
}

interface AIResult {
  type: QuestionType;
  content: string;
  explanation?: string;
  tags?: string[];
  options: string[];
  answer: string;
  answers: string[];
}

export default function AIconvertModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTags = [],
  isPremium = false,
}: AIconvertModalProps) {
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [questionType, setQuestionType] = useState<SingleQuestionType | GroupQuestionType>();
  const [sourceText, setSourceText] = useState('');
  const [convertedData, setConvertedData] = useState<Question | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<QuestionType>('單選題');

  useEffect(() => {
    if (!open) {
      setSourceText('');
      setConvertedData(null);
      setMode('single');
      setQuestionType(undefined);
      setError(null);
    }
  }, [open]);

  const textLength = sourceText.length;
  const maxLength = 1500;
  const isOverLimit = textLength > maxLength;

  const canConvert = questionType && textLength > 0 && !isOverLimit && !isConverting;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 AIconvertModal - convertedData:', convertedData);
      console.log('🧪 AIconvertModal - questionType:', questionType);
    }
  }, [convertedData, questionType]);

  function aiResultToQuestion(result: AIResult): Question {
    const baseQuestion = {
      id: uuidv4(),
      content: result.content,
      explanation: '',
      tags: []
    };

    switch (result.type) {
      case '單選題': {
        const correctIndex = result.options.findIndex(opt => opt === result.answer);
        if (correctIndex === -1) {
          console.error('找不到正確答案對應的選項:', {
            options: result.options,
            answer: result.answer
          });
        }
        return {
          ...baseQuestion,
          type: '單選題',
          options: result.options,
          answer: result.answer,
          correctIndex: correctIndex
        };
      }

      case '填空題':
        return {
          ...baseQuestion,
          type: '填空題',
          answers: result.answers
        };

      case '簡答題':
        return {
          ...baseQuestion,
          type: '簡答題',
          answer: result.answer
        };

      default:
        throw new Error(`不支援的題型: ${result.type}`);
    }
  }

  const handleConvert = async () => {
    if (!sourceText.trim()) {
      setError('請輸入題目內容');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          type: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error('轉換失敗');
      }

      const result = await response.json();
      console.log('🔥 API 回傳結果:', result);

      const question = aiResultToQuestion(result);
      console.log('🔥 轉換後的題目:', question);

      setConvertedData(question);
      toast.success('轉換成功！');
    } catch (err) {
      console.error('轉換失敗:', err);
      const errorMessage = err instanceof Error ? err.message : '轉換失敗';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] p-6 bg-cardBg dark:bg-gray-800 dark:border-gray-700">
        <DialogTitle className="text-gray-800 dark:text-mainBg">AI 題目轉換</DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-300">
          請輸入原始文字，選擇題型後點擊轉換按鈕。
        </DialogDescription>
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(80vh-3rem)]">
          <div className="flex-1 flex flex-col h-full">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-mainBg">原始文字</h3>
            <div className="flex-1 flex flex-col min-h-0">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="請貼上或輸入題目文字..."
                className="flex-1 resize-none overflow-auto bg-white dark:bg-white text-gray-800 dark:text-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={!questionType}
              />
              <div className="mt-2 flex justify-between items-center">
                <div>
                  <span className={isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-mainBg'}>
                    {textLength}
                  </span>
                  <span className="text-gray-500 dark:text-mainBg">
                    {' / '}{maxLength}
                  </span>
                </div>
                <Button
                  onClick={handleConvert}
                  disabled={!canConvert}
                  className={`min-w-[100px] transition-all ${
                    !canConvert
                      ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                      : isConverting
                        ? 'bg-primary text-white animate-pulse dark:bg-primary dark:text-white'
                      : 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white'
                  }`}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      轉換中...
                    </>
                  ) : (
                    '🚀 轉換'
                  )}
                </Button>
              </div>
              {error && (
                <div className="mt-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 h-full overflow-hidden">
            <div className="h-full overflow-y-auto pr-2">
              <QuestionFormModal
                open={true}
                onOpenChange={() => {}}
                onSubmit={onSubmit}
                defaultTags={defaultTags}
                isPremium={isPremium}
                title="AI 匯入"
                initialMode={mode}
                initialQuestionType={mode === 'single' ? (questionType as SingleQuestionType) : undefined}
                initialGroupType={mode === 'group' ? (questionType as GroupQuestionType) : undefined}
                initialData={convertedData}
                isEditMode={false}
                hideDialog={true}
                onModeChange={setMode}
                onQuestionTypeChange={setQuestionType}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

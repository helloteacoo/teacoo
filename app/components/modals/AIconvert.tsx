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
  allTags: string[];
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
  allTags
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

  // 確保 selectedType 和 questionType 同步
  useEffect(() => {
    setQuestionType(selectedType as SingleQuestionType);
  }, [selectedType]);

  const textLength = sourceText.length;
  const maxLength = 1500;
  const isOverLimit = textLength > maxLength;

  const canConvert = selectedType && textLength > 0 && !isOverLimit && !isConverting;

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
      case '填空題': {
        let rawContent: string = result.content || '';
        let answers: string[] = Array.isArray(result.answers) ? result.answers : [];

        if (result.answer && typeof result.answer === 'string') {
          answers = result.answer.split('、').map(a => a.trim());
        }

        // 🛠 將 **粗體** 自動轉成 [[...]]
        rawContent = rawContent.replace(/\*\*(.+?)\*\*/g, (_, p1) => `[[${p1.trim()}]]`);

        // 🛠 將 __底線__ 轉換（兩條底線以上）
        const underlinePattern = /__{2,}/g;
        const underlineMatches = rawContent.match(underlinePattern) || [];
        
        if (underlineMatches.length > 0) {
          let answerIndex = 0;
          rawContent = rawContent.replace(underlinePattern, () => {
            const ans = answers[answerIndex++]?.trim() || '未填';
            return `[[${ans}]]`;
          });
        }

        // 提取最終的答案
        const extractAnswersFromContent = (text: string) => {
          const matches = text.match(/\[\[(.*?)\]\]/g) || [];
          return matches.map(match => match.slice(2, -2).trim());
        };

        const finalAnswers = extractAnswersFromContent(rawContent);
        
        if (finalAnswers.length === 0 && answers.length > 0) {
          // 如果內容中沒有填空符號但有答案，自動添加填空符號
          answers.forEach(ans => {
            rawContent = rawContent.replace(ans, `[[${ans}]]`);
          });
        }

        console.log('🔍 填空題處理結果：', {
          原始內容: result.content,
          原始答案: answers,
          處理後內容: rawContent,
          最終答案: finalAnswers.length > 0 ? finalAnswers : answers
        });

        return {
          ...baseQuestion,
          type: '填空題',
          content: rawContent,
          answers: finalAnswers.length > 0 ? finalAnswers : answers
        };
      }
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

      const converted = aiResultToQuestion(result);
      console.log('🔥🔥🔥 AI 轉換成功後的 convertedData:', {
        type: converted.type,
        content: converted.content,
        answers: converted.type === '填空題' ? (converted as any).answers : undefined,
        完整資料: converted
      });

      // 檢查轉換後的內容是否有效
      const isValidContent = converted.content && converted.content.trim() !== '';
      const isValidAnswers = converted.type === '填空題' 
        ? Array.isArray((converted as any).answers) && (converted as any).answers.length > 0
        : true;

      console.log('🔍 驗證結果:', {
        isValidContent,
        isValidAnswers,
        content: converted.content,
        answers: converted.type === '填空題' ? (converted as any).answers : undefined
      });

      if (isValidContent && isValidAnswers) {
        setConvertedData(converted);
        console.log('✅ 設置 convertedData:', converted);
        
        // 延遲檢查數據是否正確顯示
        setTimeout(() => {
          const formContent = document.querySelector('.question-form-content');
          console.log('🔍 檢查表單內容:', {
            formContent: formContent?.textContent,
            hasContent: formContent && formContent.textContent?.trim()
          });
          
          if (formContent && formContent.textContent?.trim()) {
            toast.success('轉換成功！');
          } else {
            setError('轉換結果無法顯示，請重試');
            toast.error('轉換結果無法顯示，請重試');
            setConvertedData(null);
          }
        }, 500);
      } else {
        setError('轉換結果無效，請重試');
        toast.error('轉換結果無效，請重試');
        console.log('❌ 轉換結果無效');
      }
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
          選擇題型→貼上題目→點擊轉換→加入標籤→完成
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
            <div className="h-full overflow-y-auto pr-2 pt-4">
              <QuestionFormModal
                open={true}
                onOpenChange={() => {}}
                onSubmit={onSubmit}
                defaultTags={defaultTags}
                isPremium={isPremium}
                title=""
                initialMode={mode}
                initialQuestionType={selectedType as SingleQuestionType}
                initialGroupType={mode === 'group' ? (questionType as GroupQuestionType) : undefined}
                initialData={convertedData}
                isEditMode={false}
                hideDialog={true}
                onModeChange={setMode}
                onQuestionTypeChange={setQuestionType}
                allTags={allTags}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

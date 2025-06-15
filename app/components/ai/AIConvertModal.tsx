import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import type { Question, MultipleChoiceQuestion } from '@/app/types/question';
import { TextareaInputPanel } from './TextareaInputPanel';
import { EditableQuestionPreviewCard } from './EditableQuestionPreviewCard';
import TagSelector from '../TagSelector';
import { toast } from 'sonner';
import { Button } from "@/app/components/ui/button";
import { convertToQuestion } from "@/app/lib/ai/convertQuestion";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (question: Question) => void;
  availableTags: string[];
}

export function AIConvertModal({ open, onOpenChange, onImport, availableTags }: Props) {
  const [input, setInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedQuestions, setConvertedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleConvert = async (text: string) => {
    if (!text.trim()) {
      toast.error('請輸入題目內容');
      return;
    }

    setIsConverting(true);
    try {
      const questions = await convertToQuestion(text);
      setConvertedQuestions(Array.isArray(questions) ? questions : [questions]);
      setCurrentIndex(0);
    } catch (error) {
      toast.error('轉換失敗', {
        description: error instanceof Error ? error.message : "請檢查輸入格式是否正確",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleImport = (question: Question) => {
    try {
      let processedQuestion = { ...question };
      
      // 特別處理多選題的資料結構
      if (processedQuestion.type === '多選題') {
        const multipleChoiceQuestion = processedQuestion as MultipleChoiceQuestion;
        if (!Array.isArray(multipleChoiceQuestion.answers)) {
          multipleChoiceQuestion.answers = [];
        }
        if (!Array.isArray(multipleChoiceQuestion.options)) {
          multipleChoiceQuestion.options = [];
        }
      }
      
      const questionWithMetadata = {
        ...processedQuestion,
        id: uuidv4(),
        tags: processedQuestion.tags || selectedTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 呼叫父組件的 onImport
      onImport(questionWithMetadata);

      // 如果還有下一題，自動前進到下一題
      if (currentIndex < convertedQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // 如果是最後一題，清空並關閉視窗
        setInput('');
        setConvertedQuestions([]);
        setCurrentIndex(0);
        setSelectedTags([]);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('匯入失敗:', error);
      toast.error('匯入失敗，請稍後再試');
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(convertedQuestions.length - 1, prev + 1));
  };

  const handleSkip = () => {
    if (currentIndex < convertedQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 如果是最後一題，清空並關閉視窗
      setInput('');
      setConvertedQuestions([]);
      setCurrentIndex(0);
      onOpenChange(false);
    }
  };

  // 當 modal 關閉時清除所有資訊
  useEffect(() => {
    if (!open) {
      setInput('');
      setConvertedQuestions([]);
      setCurrentIndex(0);
      setSelectedTags([]);
      setIsConverting(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1400px] bg-mainBg dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>AI 題目轉換</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 h-auto lg:h-[calc(90vh-6rem)]">
          <div className="h-[35vh] lg:h-full overflow-hidden">
            <TextareaInputPanel
              value={input}
              onChange={setInput}
              onConvert={handleConvert}
              isConverting={isConverting}
              isOpen={open}
            />
          </div>
          <div className="h-[50vh] lg:h-full overflow-y-auto">
            {convertedQuestions.length > 0 ? (
              <EditableQuestionPreviewCard
                question={convertedQuestions[currentIndex]}
                currentIndex={currentIndex}
                totalQuestions={convertedQuestions.length}
                availableTags={availableTags}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onImport={handleImport}
                onSkip={handleSkip}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                請貼上題目後點選「轉換」
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
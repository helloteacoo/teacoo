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
import { convertQuestionsWithAI } from "@/app/lib/ai/convertPrompt";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questions: Question[]) => void;
  availableTags: string[];
}

export function AIConvertModal({ open, onOpenChange, onImport, availableTags }: Props) {
  const [input, setInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedQuestions, setConvertedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleConvert = async (text: string) => {
    if (!text.trim()) {
      toast.error('請輸入題目內容');
      return;
    }

    setIsConverting(true);
    try {
      const questions = await convertQuestionsWithAI(text);
      setConvertedQuestions(questions);
      setCurrentIndex(0);
    } catch (error) {
      toast.error('轉換失敗', {
        description: error instanceof Error ? error.message : "請檢查輸入格式是否正確",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < convertedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleImport = (questions: Question[]) => {
    onImport(questions);
    onOpenChange(false);
  };

  const handleSkip = () => {
    handleNext();
  };

  // 當 modal 關閉時清除所有資訊
  useEffect(() => {
    if (!open) {
      setInput('');
      setConvertedQuestions([]);
      setCurrentIndex(0);
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
                questions={convertedQuestions}
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
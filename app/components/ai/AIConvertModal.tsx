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
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questions: Question[]) => void;
  availableTags: string[];
  isPremium?: boolean;
}

const FREE_DAILY_LIMIT = 300;
const PREMIUM_DAILY_LIMIT = 10;

export function AIConvertModal({ open, onOpenChange, onImport, availableTags, isPremium = false }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedQuestions, setConvertedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingConversions, setRemainingConversions] = useState<number>(isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT);

  // 從 localStorage 讀取今天的轉換次數
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('aiConvertUsage');
    if (storedData) {
      const { date, count } = JSON.parse(storedData);
      if (date === today) {
        const limit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
        setRemainingConversions(Math.max(0, limit - count));
      } else {
        // 如果是新的一天，重置次數
        localStorage.setItem('aiConvertUsage', JSON.stringify({ date: today, count: 0 }));
        setRemainingConversions(isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT);
      }
    } else {
      localStorage.setItem('aiConvertUsage', JSON.stringify({ date: today, count: 0 }));
      setRemainingConversions(isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT);
    }
  }, [isPremium, open]);

  const updateConversionCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('aiConvertUsage');
    const currentData = storedData ? JSON.parse(storedData) : { date: today, count: 0 };
    
    if (currentData.date !== today) {
      currentData.date = today;
      currentData.count = 1;
    } else {
      currentData.count += 1;
    }
    
    localStorage.setItem('aiConvertUsage', JSON.stringify(currentData));
    const limit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    setRemainingConversions(Math.max(0, limit - currentData.count));
  };

  const handleConvert = async (text: string) => {
    if (!text.trim()) {
      toast.error(t('ai.convert.errors.emptyInput'));
      return;
    }

    if (remainingConversions <= 0) {
      toast.error(isPremium ? t('ai.convert.premiumLimit') : t('ai.convert.freeLimit'));
      return;
    }

    setIsConverting(true);
    try {
      const questions = await convertQuestionsWithAI(text);
      setConvertedQuestions(questions);
      setCurrentIndex(0);
      updateConversionCount();
    } catch (error) {
      toast.error(t('ai.convert.errors.conversionFailed'), {
        description: error instanceof Error ? error.message : t('ai.convert.errors.formatError'),
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
      <DialogContent className="max-w-[90vw] w-[1400px] bg-mainBg dark:bg-gray-800 max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{t('ai.convert.title')}</DialogTitle>
          <div className="text-sm text-gray-500 mr-8">
            {t('ai.convert.remainingUses', {
              remaining: remainingConversions,
              total: isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT
            })}
          </div>
        </DialogHeader>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 h-auto lg:h-[calc(90vh-6rem)]">
          <div className="h-[30vh] lg:h-full flex flex-col">
            <TextareaInputPanel
              value={input}
              onChange={setInput}
              onConvert={handleConvert}
              isConverting={isConverting}
              isOpen={open}
            />
          </div>
          <div className="h-[45vh] lg:h-full overflow-y-auto">
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
                {t('ai.convert.previewPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
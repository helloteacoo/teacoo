import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import type { Question, MultipleChoiceQuestion } from '@/app/types/question';
import { TextareaInputPanel } from './TextareaInputPanel';
import { EditableQuestionPreviewCard } from './EditableQuestionPreviewCard';
import TagSelector from '../TagSelector';
import { toast } from 'sonner';
import { Button } from "@/app/components/ui/button";
import { convertQuestionsWithAI } from "@/app/lib/ai/convertPrompt";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/lib/contexts/auth';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questions: Question[]) => void;
  availableTags: string[];
}

interface AIUsageLimit {
  count: number;
  lastUsedDate: string;
}

const FREE_DAILY_LIMIT = 3;
const PREMIUM_DAILY_LIMIT = 10;

export function AIConvertModal({ open, onOpenChange, onImport, availableTags }: Props) {
  const { t } = useTranslation();
  const { user, isPremium } = useAuth();
  const [input, setInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedQuestions, setConvertedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 檢查並更新使用次數
  const checkAndUpdateUsage = async () => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      const usageRef = doc(db, 'usage', user.uid);
      const usageDoc = await getDoc(usageRef);
      
      let currentUsage: AIUsageLimit = {
        count: 0,
        lastUsedDate: today
      };

      if (usageDoc.exists()) {
        const data = usageDoc.data() as AIUsageLimit;
        // 如果是新的一天，重置計數
        if (data.lastUsedDate !== today) {
          currentUsage.count = 0;
        } else {
          currentUsage = data;
        }
      }

      const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
      
      // 確保 count 不會超過限制
      currentUsage.count = Math.min(currentUsage.count, dailyLimit);
      
      if (currentUsage.count >= dailyLimit) {
        toast.error(t('ai.convert.errors.limitReached'), {
          description: isPremium 
            ? t('ai.convert.premiumLimit')
            : t('ai.convert.freeLimit')
        });
        setUsageCount(currentUsage.count); // 更新顯示的使用次數
        return false;
      }

      // 更新使用次數
      const newCount = currentUsage.count + 1;
      await setDoc(usageRef, {
        count: newCount,
        lastUsedDate: today
      }, { merge: true });

      setUsageCount(newCount);
      return true;
    } catch (error) {
      console.error('檢查使用次數時發生錯誤:', error);
      toast.error(t('ai.convert.errors.checkUsageFailed'));
      return false;
    }
  };

  // 載入使用次數
  useEffect(() => {
    const loadUsageCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, 'usage', user.uid);
        const usageDoc = await getDoc(usageRef);
        
        if (usageDoc.exists()) {
          const data = usageDoc.data() as AIUsageLimit;
          if (data.lastUsedDate === today) {
            const limit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
            const count = Math.min(data.count, limit);
            setUsageCount(count);
            
            // 如果已經達到限制，顯示提示
            if (count >= limit) {
              toast.error(t('ai.convert.errors.limitReached'), {
                description: isPremium 
                  ? t('ai.convert.premiumLimit')
                  : t('ai.convert.freeLimit')
              });
            }
          } else {
            setUsageCount(0);
          }
        } else {
          setUsageCount(0);
        }
      } catch (error) {
        console.error('載入使用次數時發生錯誤:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadUsageCount();
    }
  }, [user, open, isPremium, t]);

  const handleConvert = async (text: string) => {
    if (!text.trim()) {
      toast.error(t('ai.convert.errors.emptyInput'));
      return;
    }

    if (!user) {
      toast.error(t('ai.convert.errors.loginRequired'));
      return;
    }

    const canProceed = await checkAndUpdateUsage();
    if (!canProceed) return;

    setIsConverting(true);
    try {
      const questions = await convertQuestionsWithAI(text);
      setConvertedQuestions(questions);
      setCurrentIndex(0);
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

  const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const remainingUses = Math.max(0, dailyLimit - usageCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[90vw] w-[1400px] max-h-[90vh] md:max-h-[85vh] bg-mainBg dark:bg-gray-800 rounded-2xl md:rounded-lg" 
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-base md:text-lg">
            <span>{t('ai.convert.title')}</span>
            {!isLoading && (
              remainingUses > 0 ? (
                <span className="text-xs md:text-sm font-normal text-gray-500">
                  {t('ai.convert.remainingUses', { remaining: remainingUses, total: dailyLimit })}
                </span>
              ) : (
                <span className="text-xs md:text-sm font-normal text-red-500">
                  {t('ai.convert.limitReached', { remaining: 0, total: dailyLimit })}
                </span>
              )
            )}
          </DialogTitle>
          <DialogDescription id="dialog-description" className="text-sm">
            {t('ai.convert.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 h-[60vh] lg:h-[calc(90vh-6rem)]">
          <div className="h-[35vh] lg:h-full overflow-hidden">
            <TextareaInputPanel
              value={input}
              onChange={setInput}
              onConvert={handleConvert}
              isConverting={isConverting}
              isOpen={open}
            />
          </div>
          <div className="h-[25vh] lg:h-full overflow-y-auto">
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
              <div className="flex items-center justify-center h-full text-gray-500 text-sm md:text-base">
                {t('ai.convert.previewPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
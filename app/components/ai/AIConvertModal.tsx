import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import type { Question } from '@/app/types/question';
import { TextareaInputPanel } from './TextareaInputPanel';
import { QuestionPreviewCard } from './QuestionPreviewCard';
import TagSelector from '../TagSelector';
import { toast } from 'sonner';
import { Button } from "@/app/components/ui/button";
import { convertToQuestion } from "@/app/lib/ai/convertQuestion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (question: Question) => void;
  availableTags: string[];
}

export function AIConvertModal({ open, onOpenChange, onImport, availableTags }: Props) {
  const [input, setInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedQuestion, setConvertedQuestion] = useState<Question | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleConvert = async (text: string) => {
    if (!text.trim()) {
      toast.error('請輸入題目內容');
      return;
    }

    setIsConverting(true);
    try {
      const question = await convertToQuestion(text);
      setConvertedQuestion(question);
    } catch (error) {
      toast.error('轉換失敗', {
        description: error instanceof Error ? error.message : "請檢查輸入格式是否正確",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleImport = () => {
    if (!convertedQuestion || selectedTags.length === 0) return;
    
    // 加入選擇的標籤
    const questionWithTags = {
      ...convertedQuestion,
      tags: selectedTags,
    };
    
    onImport(questionWithTags);
    setInput('');
    setConvertedQuestion(null);
    setSelectedTags([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>AI 題目轉換</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-8 h-[calc(80vh-8rem)]">
          <div className="h-full overflow-hidden">
            <TextareaInputPanel
              value={input}
              onChange={setInput}
              onConvert={handleConvert}
              isConverting={isConverting}
            />
          </div>
          <div className="h-full overflow-y-auto">
            {convertedQuestion ? (
              <div className="space-y-4">
                <QuestionPreviewCard
                  question={convertedQuestion}
                  currentIndex={0}
                  totalQuestions={1}
                  onPrevious={() => {}}
                  onNext={() => {}}
                  onImport={handleImport}
                  onSkip={() => {}}
                  importDisabled={selectedTags.length === 0}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">選擇標籤</label>
                  <TagSelector
                    value={selectedTags}
                    onChange={setSelectedTags}
                    allTags={availableTags}
                    maxTags={4}
                    minTags={1}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    取消
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={selectedTags.length === 0}
                  >
                    匯入
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                尚未轉換，請貼上題目後點選「轉換」
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
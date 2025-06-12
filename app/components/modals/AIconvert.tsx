"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import AddQuestionModal from './AddQuestionModal';
import QuestionFormModal from './QuestionFormModal';
import type { Question } from '../../types/question';
import type { SingleQuestionType, GroupQuestionType } from './QuestionFormModal';

export interface AIconvertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
}

export default function AIconvertModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTags = [],
  isPremium = false,
}: AIconvertModalProps) {
  // 狀態管理
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [questionType, setQuestionType] = useState<SingleQuestionType | GroupQuestionType>();
  const [sourceText, setSourceText] = useState('');
  const [convertedData, setConvertedData] = useState<Question | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // 重置狀態
  useEffect(() => {
    if (!open) {
      setSourceText('');
      setConvertedData(null);
      setMode('single');
      setQuestionType(undefined);
    }
  }, [open]);

  // 字數限制檢查
  const textLength = sourceText.length;
  const maxLength = 1500;
  const isOverLimit = textLength > maxLength;

  // 轉換按鈕是否可用
  const canConvert = questionType && textLength > 0 && !isOverLimit && !isConverting;

  // 處理轉換
  const handleConvert = async () => {
    if (!canConvert) return;
    
    setIsConverting(true);
    try {
      // TODO: 實作 AI API 呼叫
      // const response = await fetch('/api/convert', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     text: sourceText,
      //     type: questionType,
      //   }),
      // });
      // const data = await response.json();
      // setConvertedData(data);
    } catch (error) {
      console.error('轉換失敗:', error);
      // TODO: 顯示錯誤訊息
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] p-6 bg-cardBg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(80vh-3rem)]">
          {/* 左側：原始文字輸入區 */}
          <div className="flex-1 flex flex-col h-full">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-mainBg">原始文字</h3>
            <div className="flex-1 flex flex-col min-h-0">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="請貼上或輸入題目文字..."
                className="flex-1 resize-none overflow-auto bg-cardBg dark:bg-white text-gray-800 dark:text-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-gray-300 focus:border-primary dark:focus:border-primary"
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
                      : 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white'
                  }`}
                >
                  {isConverting ? '轉換中...' : '🚀 轉換'}
                </Button>
              </div>
            </div>
          </div>

          {/* 右側：預覽區 */}
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
                initialQuestionType={mode === 'single' ? questionType as SingleQuestionType : undefined}
                initialGroupType={mode === 'group' ? questionType as GroupQuestionType : undefined}
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
"use client";

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { useAssignQuiz } from './AssignQuizContext';
import { toast } from 'sonner';

export default function AssignQuizSuccess() {
  const { state, mode } = useAssignQuiz();
  const quizUrl = `${window.location.origin}/quiz/${state.data.id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl);
      toast.success('連結已複製到剪貼簿');
    } catch (error) {
      toast.error('無法複製連結，請手動複製');
    }
  };

  const handleStart = () => {
    window.open(quizUrl, '_blank');
  };

  if (mode === 'practice') {
    return (
      <div className="space-y-2.5">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
            ✅ 準備就緒！
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            點擊下方按鈕開始練習
          </p>
        </div>

        <div className="flex justify-center pt-1">
          <Button 
            onClick={handleStart} 
            className="flex-1 h-7 sm:h-8 text-xs sm:text-sm bg-primary hover:bg-primary/80 dark:bg-primary dark:hover:bg-primary/80 rounded-md"
          >
            ▶️ 開始練習
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
          ✅ 派發成功！
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          作業已成功派發，學生可以透過以下方式進入：
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <Label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">作答連結</Label>
          <div className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 break-all">
              {quizUrl}
            </span>
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="sm"
              className="ml-1.5 sm:ml-2 whitespace-nowrap text-[10px] sm:text-xs h-6 sm:h-7 px-2 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 dark:border-gray-500 rounded-md"
            >
              📋 複製
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-100 p-2 sm:p-3 rounded-lg">
            <QRCodeSVG value={quizUrl} size={120} />
          </div>
        </div>

        <div className="flex justify-center pt-1">
          <Button 
            onClick={handleStart} 
            className="flex-1 h-7 sm:h-8 text-xs sm:text-sm bg-primary hover:bg-primary/80 dark:bg-primary dark:hover:bg-primary/80 rounded-md"
          >
            🔍 預覽作業
          </Button>
        </div>
      </div>
    </div>
  );
} 
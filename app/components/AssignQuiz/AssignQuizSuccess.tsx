"use client";

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { useAssignQuiz } from './AssignQuizContext';
import { toast } from 'sonner';

export default function AssignQuizSuccess() {
  const { state } = useAssignQuiz();
  const quizUrl = `${window.location.origin}/quiz/${state.data.id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl);
      toast.success('作業連結已複製到剪貼簿');
    } catch (error) {
      toast.error('無法複製連結，請手動複製');
    }
  };

  const handlePreview = () => {
    window.open(quizUrl, '_blank');
  };

  return (
    <div className="space-y-3 py-2">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
          ✅ 派發成功！
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          作業已成功派發，學生可以透過以下方式進入：
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">作答連結</Label>
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-300 break-all">
              {quizUrl}
            </span>
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="sm"
              className="ml-2 whitespace-nowrap text-xs h-7"
            >
              📋 複製
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={quizUrl} size={160} />
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handlePreview} className="flex-1 h-8 text-sm">
            🔍 預覽作業
          </Button>
        </div>
      </div>
    </div>
  );
} 
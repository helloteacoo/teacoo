import { Square, SquareCheckBig, Trash2, SquareX } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Question } from '@/app/types/question';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface TopbarButtonsProps {
  onAIModalChange: (open: boolean) => void;
  onAssignQuestions: () => void;
  onSelfPractice: () => void;
  selectedQuestionIds: string[];
  selectedQuestions: Question[];
  keyword: string;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onShowDeleteConfirm: () => void;
}

export default function TopbarButtons({
  onAIModalChange,
  onAssignQuestions,
  onSelfPractice,
  selectedQuestionIds,
  selectedQuestions,
  keyword,
  onKeywordChange,
  onSelectAll,
  onClearSelection,
  onShowDeleteConfirm
}: TopbarButtonsProps) {
  const { t } = useTranslation();
  
  const handleExportWord = async () => {
    if (selectedQuestions.length === 0) {
      toast.error(t('topbar.errors.selectFirst'));
      return;
    }

    try {
      const response = await fetch('/api/export/word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: selectedQuestions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('topbar.errors.exportFailed'));
      }

      // 取得 blob 並下載
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'questions.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('topbar.errors.exportFailed') + ': ' + (error instanceof Error ? error.message : t('topbar.errors.unknownError')));
    }
  };

  return (
    <div className="sticky top-[-6px] z-10 bg-mainBg dark:bg-gray-900 pb-2 border-b border-transparent overflow-hidden">
      {/* 桌面版/平板橫放布局 (lg 以上) */}
      <div className="hidden sm:flex sm:flex-col gap-4 mb-4">
        {/* 第一行：功能按鈕 */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Button 
            onClick={() => onAIModalChange(true)}
            className="text-mainBg h-8 px-3 text-sm"
          >
            {t('topbar.import')}
          </Button>
          <Button
            onClick={onAssignQuestions}
            disabled={selectedQuestionIds.length === 0}
            title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.assignSelected')}
          >
            {t('topbar.assign')}
          </Button>
          <Button 
            onClick={onSelfPractice}
            disabled={selectedQuestionIds.length === 0}
            title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.practiceSelected')}
            className="text-mainBg h-8 px-3 text-sm"
          >
            {t('topbar.practice')}
          </Button>
          <Button 
            onClick={handleExportWord}
            disabled={selectedQuestionIds.length === 0}
            title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.exportSelected')}
            className="text-mainBg h-8 px-3 text-sm"
          >
            {t('topbar.export')}
          </Button>
        </div>

        {/* 第二行：搜尋和選擇按鈕 */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Input
            placeholder={t('topbar.search')}
            className="w-[300px] text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 h-8"
            value={keyword}
            onChange={onKeywordChange}
          />
          <Button
            onClick={onSelectAll}
            className="text-mainBg h-8 px-3 text-sm"
          >
            <SquareCheckBig className="w-4 h-4" /> 
          </Button>
          <Button 
            onClick={onClearSelection} 
            className="text-mainBg h-8 px-3 text-sm"
          >
            <SquareX className="w-4 h-4"/>
          </Button>
          <Button
            onClick={onShowDeleteConfirm}
            disabled={selectedQuestionIds.length === 0}
            className="text-mainBg h-8 px-3 text-sm"
          >
            <Trash2 className="w-4 h-4" /> 
          </Button>
        </div>
      </div>

      {/* 手機版直立布局 (sm 以下) */}
      <div className="sm:hidden space-y-4 mb-4">
        <Input
          placeholder={t('topbar.search')}
          className="w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 h-8"
          value={keyword}
          onChange={onKeywordChange}
        />
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 min-w-min">
            <Button
              onClick={onSelectAll}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
               <SquareCheckBig className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onClearSelection} 
              className="whitespace-nowrap text-gray-300 h-8 px-3 text-sm"
            >
              <SquareX className="w-4 h-4"/>
            </Button>
            <Button
              onClick={onShowDeleteConfirm}
              disabled={selectedQuestionIds.length === 0}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 min-w-min">
            <Button 
              onClick={() => onAIModalChange(true)}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              {t('topbar.import')}
            </Button>
            <Button
              onClick={onAssignQuestions}
              disabled={selectedQuestionIds.length === 0}
              title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.assignSelected')}
            >
              {t('topbar.assign')}
            </Button>
            <Button 
              onClick={onSelfPractice}
              disabled={selectedQuestionIds.length === 0}
              title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.practiceSelected')}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              {t('topbar.practice')}
            </Button>
            <Button 
              onClick={handleExportWord}
              disabled={selectedQuestionIds.length === 0}
              title={selectedQuestionIds.length === 0 ? t('topbar.tooltips.selectFirst') : t('topbar.tooltips.exportSelected')}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              {t('topbar.export')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
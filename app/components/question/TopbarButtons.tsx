import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Question } from '@/app/types/question';

interface TopbarButtonsProps {
  onAIModalChange: (open: boolean) => void;
  onAssignQuestions: () => void;
  onSelfPractice: () => void;
  selectedQuestionIds: string[];
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
  keyword,
  onKeywordChange,
  onSelectAll,
  onClearSelection,
  onShowDeleteConfirm
}: TopbarButtonsProps) {
  return (
    <div className="sticky top-[-6px] z-10 bg-mainBg dark:bg-gray-900 pb-2 border-b border-transparent overflow-hidden">
      {/* 桌面版/平板橫放布局 (lg 以上) */}
      <div className="hidden sm:flex sm:flex-col gap-4 mb-4">
        {/* 第一行：功能按鈕 */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Button 
            onClick={() => onAIModalChange(true)}
            className="text-gray-200 h-8 px-3 text-sm"
          >
            🤖 AI匯入
          </Button>
          <Button
            onClick={onAssignQuestions}
            disabled={selectedQuestionIds.length === 0}
            title={selectedQuestionIds.length === 0 ? '請先選擇題目' : '派發選中的題目'}
          >
            📤 派發作業
          </Button>
          <Button 
            onClick={onSelfPractice}
            disabled={selectedQuestionIds.length === 0}
            title={selectedQuestionIds.length === 0 ? '請先選擇題目' : '開始自我練習'}
            className="text-gray-200 h-8 px-3 text-sm"
          >
            🧪 自我練習
          </Button>
          <Button className="text-gray-300 h-8 px-3 text-sm">📄 匯出題目</Button>
        </div>

        {/* 第二行：搜尋和選擇按鈕 */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <Input
            placeholder="搜尋題目關鍵字..."
            className="w-[300px] placeholder:text-gray-400 dark:placeholder:text-gray-400 h-8 text-sm"
            value={keyword}
            onChange={onKeywordChange}
          />
          <Button
            onClick={onSelectAll}
            className="text-gray-200 h-8 px-3 text-sm"
          >
            ✅ 全選
          </Button>
          <Button 
            onClick={onClearSelection} 
            className="text-gray-300 h-8 px-3 text-sm"
          >
            ⬜️ 取消
          </Button>
          <Button
            onClick={onShowDeleteConfirm}
            disabled={selectedQuestionIds.length === 0}
            className="text-gray-200 h-8 px-3 text-sm"
          >
            🗑️ 刪除
          </Button>
        </div>
      </div>

      {/* 手機版直立布局 (sm 以下) */}
      <div className="sm:hidden space-y-4 mb-4">
        <Input
          placeholder="搜尋題目關鍵字..."
          className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 h-8 text-sm"
          value={keyword}
          onChange={onKeywordChange}
        />
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 min-w-min">
            <Button
              onClick={onSelectAll}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              ✅ 全部勾選
            </Button>
            <Button 
              onClick={onClearSelection} 
              className="whitespace-nowrap text-gray-300 h-8 px-3 text-sm"
            >
              ⬜️ 全部取消
            </Button>
            <Button
              onClick={onShowDeleteConfirm}
              disabled={selectedQuestionIds.length === 0}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              🗑️ 刪除題目
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 min-w-min">
            <Button 
              onClick={() => onAIModalChange(true)}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              🤖 AI匯入
            </Button>
            <Button
              onClick={onAssignQuestions}
              disabled={selectedQuestionIds.length === 0}
              title={selectedQuestionIds.length === 0 ? '請先選擇題目' : '派發選中的題目'}
            >
              📤 派發作業
            </Button>
            <Button 
              onClick={onSelfPractice}
              disabled={selectedQuestionIds.length === 0}
              title={selectedQuestionIds.length === 0 ? '請先選擇題目' : '開始自我練習'}
              className="whitespace-nowrap text-gray-200 h-8 px-3 text-sm"
            >
              🧪 自我練習
            </Button>
            <Button className="whitespace-nowrap text-gray-300 h-8 px-3 text-sm">📄 匯出題目</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
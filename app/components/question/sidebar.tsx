import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import type { Question, ReadingQuestion, SubQuestion } from "../../types/question";
import type { Dispatch, SetStateAction } from "react";
import { Input } from '../ui/input';
import TagFolderSection from './TagFolderSection';
import type { TagsState } from '../../types/tag';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type FilterKey = string;

type Props = {
  filters: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  selectedQuestions: string[];
  setSelectedQuestions: (v: string[]) => void;
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  allTags: string[];
  isPremium?: boolean;
  onDeleteTag?: (tag: string) => void;
  onRenameTag?: (oldTag: string, newTag: string) => void;
};

const QUESTION_TYPES = {
  'singleChoice': '單選題',
  'multipleChoice': '多選題',
  'fillInBlank': '填空題',
  'shortAnswer': '簡答題',
  'reading': '閱讀測驗',
  'cloze': '克漏字'
} as const;

export default function Sidebar({
  filters,
  toggleFilter: originalToggleFilter,
  showDeleteConfirm,
  setShowDeleteConfirm,
  selectedQuestions,
  setSelectedQuestions,
  setQuestions,
  allTags,
  isPremium = false,
  onDeleteTag,
  onRenameTag
}: Props) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tagsState, setTagsState] = useState<TagsState>(() => ({
    folders: [],
    unorganizedTags: allTags
  }));

  // 處理題型勾選邏輯
  const handleFilterToggle = (key: FilterKey) => {
    // 如果是標籤，直接使用原始的 toggleFilter
    if (!Object.values(QUESTION_TYPES).includes(key as any)) {
      originalToggleFilter(key);
      return;
    }

    // 一般題型的切換
    originalToggleFilter(key);
  };

  // 當 allTags 改變時，更新未分類標籤
  React.useEffect(() => {
    setTagsState(prev => {
      // 獲取所有已在資料夾中的標籤
      const tagsInFolders = new Set(prev.folders.flatMap(f => f.tags));
      // 過濾出未在資料夾中的標籤
      const newUnorganizedTags = allTags.filter(tag => !tagsInFolders.has(tag));
      
      return {
        ...prev,
        unorganizedTags: newUnorganizedTags
      };
    });
  }, [allTags]);

  const handleDeleteTag = (tag: string) => {
    if (onDeleteTag) {
      onDeleteTag(tag);
      toast.success(`已刪除標籤：${tag}`);
    }
  };

  return (
    <div className={`
      relative transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-12' : 'w-64 md:w-72'}
      bg-mainBg dark:bg-gray-900 shadow-[inset_-1px_0_0_rgba(0,0,0,0.08)] 
      dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]
      ${isCollapsed ? 'pr-0' : 'pr-6'} mr-4
      h-full flex flex-col
    `}>
      {/* 收合按鈕 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-4 bg-mainBg dark:bg-gray-800 rounded-full p-1 shadow-md z-10
          hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <div className={`p-4 ${isCollapsed ? 'hidden' : 'block'} flex-1 overflow-y-auto`}>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
              {t('sidebar.questionTypes')}
            </h3>
            <div className="space-y-2">
              {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Checkbox
                    checked={filters[value]}
                    onCheckedChange={() => handleFilterToggle(value)}
                  />
                  <span className="text-sm">{t(`sidebar.questionType.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 標籤區 */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
              {t('sidebar.tags')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Input
                  placeholder={t('sidebar.newTag')}
                  className="mr-2 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newTag = e.currentTarget.value.trim();
                      if (!allTags.includes(newTag)) {
                        handleFilterToggle(newTag);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-xs h-8"
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="${t('sidebar.newTag')}"]`) as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newTag = input.value.trim();
                      if (!allTags.includes(newTag)) {
                        handleFilterToggle(newTag);
                        input.value = '';
                      }
                    }
                  }}
                >
                  {t('sidebar.add')}
                </Button>
              </div>

              <TagFolderSection
                isPremium={isPremium}
                tagsState={tagsState}
                setTagsState={setTagsState}
                filters={filters}
                toggleFilter={handleFilterToggle}
                onDeleteTag={handleDeleteTag}
                onRenameTag={onRenameTag}
                onTagClick={handleFilterToggle}
              />
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <ConfirmDeleteModal
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            onConfirm={() => {
              setQuestions((prev: Question[]) =>
                prev.filter(
                  (q) =>
                    (!q.id || !selectedQuestions.includes(q.id)) &&
                    (q.type !== '閱讀測驗' ||
                      !(q as ReadingQuestion).questions.some((sub: SubQuestion) => sub.id && selectedQuestions.includes(sub.id)))
                )
              );
              setSelectedQuestions([]);
              setShowDeleteConfirm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from '@radix-ui/react-icons';
import type { Question, ReadingQuestion, SubQuestion } from "../../types/question";
import type { Dispatch, SetStateAction } from "react";
import { Input } from '../ui/input';
import TagFolderSection from './TagFolderSection';
import type { TagsState } from '../../types/tag';
import { toast } from 'sonner';

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
};

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
  onDeleteTag
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tagsState, setTagsState] = useState<TagsState>(() => ({
    folders: [],
    unorganizedTags: allTags
  }));

  // 處理題型勾選邏輯
  const handleFilterToggle = (key: FilterKey) => {
    // 定義題型分類
    const singleQuestionTypes = ['單選題', '多選題', '填空題', '簡答題'];
    const groupQuestionTypes = ['閱讀測驗', '克漏字'];

    // 如果是標籤，直接使用原始的 toggleFilter
    if ([...singleQuestionTypes, ...groupQuestionTypes, '單題', '題組'].indexOf(key) === -1) {
      originalToggleFilter(key);
      return;
    }

    // 根據不同的題型進行處理
    if (key === '單題') {
      // 如果取消勾選單題，則取消所有單題類型
      const newValue = !filters['單題'];
      originalToggleFilter('單題');
      singleQuestionTypes.forEach(type => {
        if (filters[type] !== newValue) {
          originalToggleFilter(type);
        }
      });
    } else if (key === '題組') {
      // 如果取消勾選題組，則取消所有題組類型
      const newValue = !filters['題組'];
      originalToggleFilter('題組');
      groupQuestionTypes.forEach(type => {
        if (filters[type] !== newValue) {
          originalToggleFilter(type);
        }
      });
    } else if (singleQuestionTypes.includes(key)) {
      // 如果是單題類型
      originalToggleFilter(key);
      // 檢查是否需要更新單題狀態
      const shouldBeSingleChecked = singleQuestionTypes.some(type => 
        type === key ? !filters[key] : filters[type]
      );
      if (shouldBeSingleChecked !== filters['單題']) {
        originalToggleFilter('單題');
      }
    } else if (groupQuestionTypes.includes(key)) {
      // 如果是題組類型
      originalToggleFilter(key);
      // 檢查是否需要更新題組狀態
      const shouldBeGroupChecked = groupQuestionTypes.some(type => 
        type === key ? !filters[key] : filters[type]
      );
      if (shouldBeGroupChecked !== filters['題組']) {
        originalToggleFilter('題組');
      }
    }
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
            <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">題型</h3>
            <div className="space-y-2">
              {/* 單題區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Checkbox
                    checked={filters.單題}
                    onCheckedChange={() => handleFilterToggle('單題')}
                  />
                  <span className="font-medium text-sm">單題</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['單選題', '多選題', '填空題', '簡答題'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={filters[key]}
                        onCheckedChange={() => handleFilterToggle(key)}
                      />
                      <span className="text-sm">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 題組區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Checkbox
                    checked={filters.題組}
                    onCheckedChange={() => handleFilterToggle('題組')}
                  />
                  <span className="font-medium text-sm">題組</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['閱讀測驗', '克漏字'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={filters[key]}
                        onCheckedChange={() => handleFilterToggle(key)}
                      />
                      <span className="text-sm">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 標籤區 */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">標籤</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Input
                  placeholder="輸入新標籤..."
                  className="mr-2 text-xs text-gray-400 dark:text-gray-400"
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
                  className="bg-primary hover:bg-primary/90 text-xs h-8"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="輸入新標籤..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newTag = input.value.trim();
                      if (!allTags.includes(newTag)) {
                        handleFilterToggle(newTag);
                        input.value = '';
                      }
                    }
                  }}
                >
                  新增
                </Button>
              </div>

              <TagFolderSection
                isPremium={isPremium}
                tagsState={tagsState}
                setTagsState={setTagsState}
                filters={filters}
                toggleFilter={handleFilterToggle}
                onDeleteTag={handleDeleteTag}
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
                    !selectedQuestions.includes(q.id) &&
                    (q.type !== '閱讀測驗' ||
                      !(q as ReadingQuestion).questions.some((sub: SubQuestion) => selectedQuestions.includes(sub.id)))
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

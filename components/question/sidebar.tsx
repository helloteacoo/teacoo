import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import type { Question } from "@/types/question";
import type { Dispatch, SetStateAction } from "react";

export type FilterKey =
  | '單題'
  | '單選題'
  | '多選題'
  | '填空題'
  | '簡答題'
  | '題組'
  | '閱讀測驗'
  | '克漏字'
  | '國文'
  | '自然'
  | '國小'
  | '國中';

type Props = {
  filters: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  selectedQuestions: string[];
  setSelectedQuestions: (v: string[]) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
};

export default function Sidebar({
  filters,
  toggleFilter,
  showDeleteConfirm,
  setShowDeleteConfirm,
  selectedQuestions,
  setSelectedQuestions,
  setQuestions,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`
      relative transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-12' : 'w-64 md:w-72'}
      bg-mainBg dark:bg-gray-900 shadow-[inset_-1px_0_0_rgba(0,0,0,0.08)] 
      dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]
      ${isCollapsed ? 'pr-0' : 'pr-6'} mr-4
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

      <div className={`p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">題型</h3>
            <div className="space-y-2">
              {/* 單題區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Checkbox
                    checked={filters.單題}
                    onCheckedChange={() => toggleFilter('單題')}
                  />
                  <span className="font-medium">單題</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['單選題', '多選題', '填空題', '簡答題'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={filters[key as FilterKey]}
                        onCheckedChange={() => toggleFilter(key as FilterKey)}
                      />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 題組區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Checkbox
                    checked={filters.題組}
                    onCheckedChange={() => toggleFilter('題組')}
                  />
                  <span className="font-medium">題組</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['閱讀測驗', '克漏字'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Checkbox
                        checked={filters[key as FilterKey]}
                        onCheckedChange={() => toggleFilter(key as FilterKey)}
                      />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 標籤區 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">標籤</h3>
            <div className="flex flex-wrap gap-2">
              {['國文', '自然', '國小', '國中'].map((key) => (
                <Button
                  key={key}
                  onClick={() => toggleFilter(key as FilterKey)}
                  className={`px-3 py-1 rounded-full transition-colors border-none focus:outline-none ${
                    filters[key as FilterKey]
                      ? 'bg-primary text-white'
                      : 'bg-blue-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <ConfirmDeleteModal
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
              setQuestions((prev: Question[]) =>
                prev.filter(
                  (q) =>
                    !selectedQuestions.includes(q.id) &&
                    (q.type !== '閱讀測驗' ||
                      !q.questions.some((sub) => selectedQuestions.includes(sub.id)))
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

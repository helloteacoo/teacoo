"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import SingleQuestionForm from '../question/SingleQuestionForm';
import GroupQuestionForm from '../question/GroupQuestionForm';
import type { Question, QuestionType } from '../../types/question';
import { Button } from '../ui/button';

type BaseFormData = {
  content: string;
  explanation: string;
  tags: string[];
  type: SingleQuestionType | GroupQuestionType;
};

type SingleQuestionFormData = BaseFormData & (
  | { type: '單選題'; options: string[]; answer: string }
  | { type: '填空題'; answers: string[]; content: string }
  | { type: '簡答題'; answer: string }
);

export type SingleQuestionType = '單選題' | '多選題' | '填空題' | '簡答題';
export type GroupQuestionType = '閱讀測驗' | '克漏字';
export type QuestionMode = 'single' | 'group';

export interface QuestionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  title?: string;
  initialMode?: 'single' | 'group';
  initialQuestionType?: SingleQuestionType;
  initialGroupType?: GroupQuestionType;
  initialData?: Question | null;
  isEditMode?: boolean;
  hideDialog?: boolean;
  onModeChange?: (mode: 'single' | 'group') => void;
  onQuestionTypeChange?: (type: SingleQuestionType | GroupQuestionType | undefined) => void;
  onGroupTypeChange?: (type: GroupQuestionType) => void;
  checkGroupPermission?: () => Promise<boolean>;
  onGroupSubmitSuccess?: (question: Question) => Promise<void>;
  allTags: string[];
}

export default function QuestionFormModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTags = [],
  isPremium = false,
  title = '新增題目',
  initialMode = 'single',
  initialQuestionType,
  initialGroupType,
  initialData = null,
  isEditMode = false,
  hideDialog = false,
  onModeChange,
  onQuestionTypeChange,
  onGroupTypeChange,
  checkGroupPermission = async () => true,
  onGroupSubmitSuccess,
  allTags
}: QuestionFormModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<'single' | 'group'>(initialMode);
  const [questionType, setQuestionType] = useState<SingleQuestionType | undefined>(
    initialQuestionType
  );
  const [groupType, setGroupType] = useState<GroupQuestionType | undefined>(
    initialGroupType
  );
  const [key, setKey] = useState(0);
  const [lastUsedTags, setLastUsedTags] = useState<string[]>(defaultTags);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 當 initialData 改變時，更新表單狀態
  useEffect(() => {
    if (isEditMode && !initialData) {
      return;
    }

    if (initialData) {
      // 設置題型
      if (['閱讀測驗', '克漏字'].includes(initialData.type)) {
        setMode('group');
        setGroupType(initialData.type as '閱讀測驗' | '克漏字');
        if (onGroupTypeChange) onGroupTypeChange(initialData.type as '閱讀測驗' | '克漏字');
      } else {
        setMode('single');
        setQuestionType(initialData.type as SingleQuestionType);
        if (onQuestionTypeChange) onQuestionTypeChange(initialData.type as SingleQuestionType);
      }

      // 更新最後使用的標籤
      setLastUsedTags(initialData.tags);
    }
  }, [initialData, isEditMode, onQuestionTypeChange, onGroupTypeChange]);

  // 重置表單狀態
  const resetForm = () => {
    setMode(initialMode);
    setQuestionType(initialQuestionType);
    setGroupType(initialGroupType);
    setKey(prev => prev + 1);
    setLastUsedTags(defaultTags);
  };

  // 當 Modal 關閉時重置表單
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, initialMode, initialQuestionType, initialGroupType, defaultTags]);

  // 同步外部狀態
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  useEffect(() => {
    onQuestionTypeChange?.(mode === 'single' ? questionType : groupType);
  }, [mode, questionType, groupType, onQuestionTypeChange]);

  const handleModeChange = (newMode: 'single' | 'group') => {
    setMode(newMode);
    setQuestionType(undefined);
    setGroupType(undefined);
    setKey(prev => prev + 1);
    onModeChange?.(newMode);
  };

  const handleQuestionTypeChange = (type: SingleQuestionType | GroupQuestionType | undefined) => {
    setQuestionType(type as SingleQuestionType);
    setGroupType(type as GroupQuestionType);
    onQuestionTypeChange?.(type);
  };

  const handleGroupTypeChange = async (type: GroupQuestionType) => {
    if (!(await checkGroupPermission())) {
      return;
    }
    setGroupType(type);
    onGroupTypeChange?.(type);
  };

  const handleSingleQuestionSubmit = (data: Question) => {
    onSubmit(data);
    setLastUsedTags(data.tags);
  };

  const handleGroupQuestionSubmit = async (data: Question) => {
    onSubmit(data);
    setLastUsedTags(data.tags);
    if (onGroupSubmitSuccess) {
      await onGroupSubmitSuccess(data);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="space-y-4">
        {!isEditMode && (
          <div className="grid w-full grid-cols-2">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={() => handleModeChange('single')}
                variant={mode === 'single' ? 'default' : 'outline'}
                className={`w-full ${
                  mode === 'single'
                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                單題
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={() => handleModeChange('group')}
                variant={mode === 'group' ? 'default' : 'outline'}
                className={`w-full ${
                  mode === 'group'
                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                    : 'text-gray-600 dark:text-gray-800 dark:border-gray-700 dark:hover:bg-gray-300'
                }`}
              >
                題組
              </Button>
            </div>
          </div>
        )}

        {mode === 'single' && (
          <div className="grid w-full grid-cols-4 gap-2">
            {(['單選題', '多選題', '填空題', '簡答題'] as SingleQuestionType[]).map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => handleQuestionTypeChange(type)}
                variant={questionType === type ? 'default' : 'outline'}
                className={`w-full ${
                  questionType === type
                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                    : 'text-gray-600 dark:text-gray-800 dark:border-gray-700 dark:hover:bg-gray-300'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        )}

        {mode === 'group' && (
          <div className="grid w-full grid-cols-2 gap-2">
            {(['閱讀測驗', '克漏字'] as GroupQuestionType[]).map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => handleGroupTypeChange(type)}
                variant={groupType === type ? 'default' : 'outline'}
                className={`w-full ${
                  groupType === type
                    ? 'bg-primary text-white dark:bg-primary dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 表單區域 */}
      <div className="mt-4">
        {mode === 'single' && (
          questionType ? (
            <SingleQuestionForm
              key={`${key}-${JSON.stringify(initialData)}`}
              type={questionType as "單選題" | "填空題" | "簡答題"}
              onChange={handleSingleQuestionSubmit}
              defaultTags={lastUsedTags}
              isPremium={isPremium}
              initialData={
                initialData && !['閱讀測驗', '克漏字'].includes(initialData.type)
                  ? initialData
                  : undefined
              }
              allTags={allTags}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              請先選擇題型
            </div>
          )
        )}

        {mode === 'group' && (
          groupType ? (
            <GroupQuestionForm
              key={`${key}-group-${JSON.stringify(initialData)}`}
              type={groupType}
              onChange={handleGroupQuestionSubmit}
              defaultTags={lastUsedTags}
              isPremium={isPremium}
              initialData={
                initialData && ['閱讀測驗', '克漏字'].includes(initialData.type)
                  ? initialData
                  : undefined
              }
              allTags={allTags}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              請先選擇題型
            </div>
          )
        )}
      </div>
    </div>
  );

  if (!isMounted) {
    return null;
  }

  if (hideDialog) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-cardBg dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-gray-200">{title}</DialogTitle>
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import SingleQuestionForm from '../question/SingleQuestionForm';
import GroupQuestionForm from '../question/GroupQuestionForm';
import type { Question, QuestionType } from '../../types/question';
import type { 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  FillInQuestion, 
  ShortAnswerQuestion, 
  ReadingQuestion,
  ClozeQuestion 
} from '../../types/question';

type BaseFormData = {
  content: string;
  explanation: string;
  tags: string[];
};

type SingleQuestionFormData = BaseFormData & (
  | { type: '單選題'; options: string[]; answer: string }
  | { type: '多選題'; options: string[]; answer: string[] }
  | { type: '填空題'; answers: string[] }
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
  initialMode?: QuestionMode;
  initialQuestionType?: SingleQuestionType;
  initialGroupType?: GroupQuestionType;
  initialData?: Question | null;
  isEditMode?: boolean;
  onModeChange?: (mode: QuestionMode) => void;
  onQuestionTypeChange?: (type: SingleQuestionType) => void;
  onGroupTypeChange?: (type: GroupQuestionType) => void;
  checkGroupPermission?: () => boolean;
  onGroupSubmitSuccess?: () => void;
}

export default function QuestionFormModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTags = [],
  isPremium = false,
  title = '新增題目',
  initialMode = 'single',
  initialQuestionType = undefined,
  initialGroupType = undefined,
  initialData = null,
  isEditMode = false,
  onModeChange,
  onQuestionTypeChange,
  onGroupTypeChange,
  checkGroupPermission = () => true,
  onGroupSubmitSuccess
}: QuestionFormModalProps) {
  const [mode, setMode] = useState<QuestionMode>(initialMode);
  const [questionType, setQuestionType] = useState<SingleQuestionType | undefined>(initialQuestionType);
  const [groupType, setGroupType] = useState<GroupQuestionType | undefined>(initialGroupType);
  const [key, setKey] = useState(0);
  const [lastUsedTags, setLastUsedTags] = useState<string[]>(defaultTags);

  // 當 initialData 改變時，更新表單狀態
  useEffect(() => {
    console.log('🧪 QuestionFormModal - initialData:', initialData);
    console.log('🧪 QuestionFormModal - isEditMode:', isEditMode);
    
    if (isEditMode && initialData) {
      if (['閱讀測驗', '克漏字'].includes(initialData.type)) {
        setMode('group');
        setGroupType(initialData.type as GroupQuestionType);
      } else {
        setMode('single');
        setQuestionType(initialData.type as SingleQuestionType);
      }
      // 更新最後使用的標籤
      setLastUsedTags(initialData.tags);
    }
  }, [isEditMode, initialData]);

  // 如果是編輯模式但沒有初始資料，不要渲染
  if (isEditMode && !initialData) {
    console.log('🧪 QuestionFormModal - 等待初始資料...');
    return null;
  }

  const handleModeChange = (newMode: QuestionMode) => {
    setMode(newMode);
    setQuestionType(undefined);
    setGroupType(undefined);
    setKey(prev => prev + 1);
    onModeChange?.(newMode);
  };

  const handleQuestionTypeChange = (type: SingleQuestionType) => {
    setQuestionType(type);
    onQuestionTypeChange?.(type);
  };

  const handleGroupTypeChange = (type: GroupQuestionType) => {
    if (!checkGroupPermission()) {
      return;
    }
    setGroupType(type);
    onGroupTypeChange?.(type);
  };

  const handleSingleQuestionSubmit = (data: Question) => {
    onSubmit(data);
    setLastUsedTags(data.tags);
  };

  const handleGroupQuestionSubmit = (data: Question) => {
    onSubmit(data);
    setLastUsedTags(data.tags);
    onGroupSubmitSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditMode && (
            <div className="grid w-full grid-cols-2">
              <button
                type="button"
                className={`px-4 py-2 border rounded ${mode === 'single' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleModeChange('single')}
              >
                單題
              </button>
              <button
                type="button"
                className={`px-4 py-2 border rounded ${mode === 'group' ? 'bg-primary text-white' : ''}`}
                onClick={() => handleModeChange('group')}
              >
                題組
              </button>
            </div>
          )}

          {mode === 'single' && (
            <div className="space-y-4">
              <div className="grid w-full grid-cols-4">
                {(['單選題', '多選題', '填空題', '簡答題'] as SingleQuestionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-4 py-2 border rounded ${questionType === type ? 'bg-primary text-white' : ''}`}
                    onClick={() => handleQuestionTypeChange(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {questionType && (
                <SingleQuestionForm
                  key={`single-${key}`}
                  type={questionType}
                  onChange={handleSingleQuestionSubmit}
                  defaultTags={lastUsedTags}
                  isPremium={isPremium}
                  initialData={isEditMode && initialData && !['閱讀測驗', '克漏字'].includes(initialData.type) ? initialData : undefined}
                />
              )}
            </div>
          )}

          {mode === 'group' && (
            <div className="space-y-4">
              <div className="grid w-full grid-cols-2">
                {(['閱讀測驗', '克漏字'] as GroupQuestionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-4 py-2 border rounded ${groupType === type ? 'bg-primary text-white' : ''}`}
                    onClick={() => handleGroupTypeChange(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {groupType && (
                <GroupQuestionForm
                  key={`group-${key}`}
                  type={groupType}
                  onChange={handleGroupQuestionSubmit}
                  defaultTags={lastUsedTags}
                  isPremium={isPremium}
                  initialData={isEditMode && initialData && ['閱讀測驗', '克漏字'].includes(initialData.type) ? initialData : undefined}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
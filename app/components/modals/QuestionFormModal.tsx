"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import SingleQuestionForm from '../question/SingleQuestionForm';
import GroupQuestionForm from '../question/GroupQuestionForm';
import type { FormMode, Question } from '../../types/question';
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

type GroupQuestionType = '閱讀測驗' | '克漏字' | '';
type SingleQuestionType = '單選題' | '多選題' | '填空題' | '簡答題' | '';

interface QuestionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  title?: string;
  initialMode?: FormMode;
  initialQuestionType?: SingleQuestionType;
  initialGroupType?: GroupQuestionType;
  onModeChange?: (mode: FormMode) => void;
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
  initialQuestionType = '',
  initialGroupType = '',
  onModeChange,
  onQuestionTypeChange,
  onGroupTypeChange,
  checkGroupPermission = () => true,
  onGroupSubmitSuccess
}: QuestionFormModalProps) {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [questionType, setQuestionType] = useState<SingleQuestionType>(initialQuestionType);
  const [groupType, setGroupType] = useState<GroupQuestionType>(initialGroupType);
  const [lastUsedTags, setLastUsedTags] = useState<string[]>(defaultTags);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setQuestionType('');
      setGroupType('');
    }
  }, [open, initialMode]);

  const handleModeChange = (newMode: FormMode) => {
    if (newMode === 'group' && !checkGroupPermission()) {
      return;
    }
    setMode(newMode);
    setKey(prev => prev + 1);
    onModeChange?.(newMode);
  };

  const handleQuestionTypeChange = (newType: SingleQuestionType) => {
    setQuestionType(newType);
    setKey(prev => prev + 1);
    onQuestionTypeChange?.(newType);
  };

  const handleGroupTypeChange = (newType: GroupQuestionType) => {
    setGroupType(newType);
    setKey(prev => prev + 1);
    onGroupTypeChange?.(newType);
  };

  const handleSingleQuestionSubmit = (data: SingleQuestionFormData) => {
    try {
      const questionId = Math.random().toString(36).substring(7);
      setLastUsedTags(data.tags);
      onSubmit({ ...data, id: questionId } as Question);
      onOpenChange(false);
    } catch (error) {
      console.error('新增單題失敗:', error);
      alert('新增題目失敗，請稍後再試');
    }
  };

  const handleGroupQuestionSubmit = (data: ReadingQuestion | ClozeQuestion) => {
    try {
      if (!checkGroupPermission()) {
        return;
      }

      const questionId = Math.random().toString(36).substring(7);
      setLastUsedTags(data.tags);
      onSubmit({ ...data, id: questionId });
      onGroupSubmitSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('新增題組失敗:', error);
      alert('新增題目失敗，請稍後再試');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                />
              )}
            </div>
          )}

          {mode === 'group' && (
            <div className="space-y-4">
              <div className="grid w-full grid-cols-2">
                {(['閱讀測驗', '克漏字'] as const).map((type) => (
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
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
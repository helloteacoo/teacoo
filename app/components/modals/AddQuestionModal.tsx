"use client";

import QuestionFormModal from './QuestionFormModal';
import type { Question } from '../../types/question';

// 檢查是否超過每日題組限制
const checkGroupQuestionLimit = (isPremium: boolean): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const storedData = localStorage.getItem('groupQuestionCount');
  const data = storedData ? JSON.parse(storedData) : {};
  
  // 如果是新的一天，重置計數
  if (!data[today]) {
    data[today] = 0;
    localStorage.setItem('groupQuestionCount', JSON.stringify(data));
  }
  
  // 付費版不限制
  if (isPremium) return true;
  
  // 免費版限制每天1組
  return data[today] < 1;
};

// 更新今日題組計數
const incrementGroupQuestionCount = () => {
  const today = new Date().toISOString().split('T')[0];
  const storedData = localStorage.getItem('groupQuestionCount');
  const data = storedData ? JSON.parse(storedData) : {};
  
  if (!data[today]) {
    data[today] = 0;
  }
  
  data[today]++;
  localStorage.setItem('groupQuestionCount', JSON.stringify(data));
};

interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
}

export default function AddQuestionModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  defaultTags = [], 
  isPremium = false 
}: AddQuestionModalProps) {
  const checkPermission = () => {
    const hasPermission = checkGroupQuestionLimit(isPremium);
    if (!hasPermission) {
      alert('免費版每天只能新增1組題目（閱讀測驗或克漏字）。升級至付費版即可無限新增！');
    }
    return hasPermission;
  };

  return (
    <QuestionFormModal
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      defaultTags={defaultTags}
      isPremium={isPremium}
      title="新增題目"
      checkGroupPermission={checkPermission}
      onGroupSubmitSuccess={incrementGroupQuestionCount}
    />
  );
} 
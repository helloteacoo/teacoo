"use client";

import QuestionFormModal from './QuestionFormModal';
import type { Question } from '../../types/question';
import type { SingleQuestionType, GroupQuestionType } from './QuestionFormModal';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';

// 檢查是否超過每日題組限制
const checkGroupQuestionLimit = async (isPremium: boolean): Promise<boolean> => {
  // 付費版不限制
  if (isPremium) return true;

  const today = new Date().toISOString().split('T')[0];
  const groupQuestionsRef = collection(db, 'groupQuestions');
  const q = query(
    groupQuestionsRef,
    where('createdAt', '>=', today),
    where('createdAt', '<', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
  );

  const querySnapshot = await getDocs(q);
  const count = querySnapshot.size;

  // 免費版限制每天1組
  return count < 1;
};

// 更新今日題組計數
const incrementGroupQuestionCount = async (question: Question) => {
  if (['閱讀測驗', '克漏字'].includes(question.type)) {
    await addDoc(collection(db, 'groupQuestions'), {
      questionId: question.id,
      createdAt: new Date().toISOString()
    });
  }
};

export interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  initialData?: Question | null;
  isEditMode?: boolean;
  allTags: string[];
}

export default function AddQuestionModal({
  open,
  onOpenChange,
  onSubmit,
  defaultTags = [],
  isPremium = false,
  initialData = null,
  isEditMode = false,
  allTags
}: AddQuestionModalProps) {
  const checkPermission = async () => {
    try {
      const hasPermission = await checkGroupQuestionLimit(isPremium);
      if (!hasPermission) {
        alert('免費版每天只能新增1組題目（閱讀測驗或克漏字）。升級至付費版即可無限新增！');
      }
      return hasPermission;
    } catch (error) {
      console.error('檢查權限失敗:', error);
      alert('檢查權限失敗，請稍後再試');
      return false;
    }
  };

  return (
    <QuestionFormModal
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      defaultTags={defaultTags}
      isPremium={isPremium}
      title={isEditMode ? '編輯題目' : '新增題目'}
      initialMode={isEditMode && initialData ? (
        ['閱讀測驗', '克漏字'].includes(initialData.type) ? 'group' : 'single'
      ) : 'single'}
      initialQuestionType={isEditMode && initialData && !['閱讀測驗', '克漏字'].includes(initialData.type) ? (initialData.type as SingleQuestionType) : undefined}
      initialGroupType={isEditMode && initialData && ['閱讀測驗', '克漏字'].includes(initialData.type) ? (initialData.type as GroupQuestionType) : undefined}
      initialData={initialData}
      isEditMode={isEditMode}
      checkGroupPermission={checkPermission}
      onGroupSubmitSuccess={incrementGroupQuestionCount}
      allTags={allTags}
    />
  );
} 
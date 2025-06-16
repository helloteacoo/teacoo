"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Question } from '@/app/types/question';
import { AssignQuizProvider } from './AssignQuizContext';
import AssignQuizForm from './AssignQuizForm';
import AssignQuizSuccess from './AssignQuizSuccess';
import { useAssignQuiz } from './AssignQuizContext';
import { useEffect } from 'react';

interface AssignQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestions: Question[];
}

function AssignQuizContent() {
  const { state } = useAssignQuiz();
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {state.step === 'completed' ? '派發成功' : '派發作業'}
        </DialogTitle>
      </DialogHeader>

      {state.step === 'completed' ? (
        <AssignQuizSuccess />
      ) : (
        <AssignQuizForm />
      )}
    </div>
  );
}

function AssignQuizModalContent({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { dispatch } = useAssignQuiz();

  useEffect(() => {
    if (!open) {
      dispatch({ type: 'RESET' });
    }
  }, [open, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-cardBg dark:bg-gray-800">
        <AssignQuizContent />
      </DialogContent>
    </Dialog>
  );
}

export default function AssignQuizModal({
  open,
  onOpenChange,
  selectedQuestions,
}: AssignQuizModalProps) {
  const handleSuccess = () => {
    // 派發成功後不自動關閉 Modal，讓使用者自行關閉
    // setTimeout(() => {
    //   onOpenChange(false);
    // }, 1000);
  };

  return (
    <AssignQuizProvider 
      selectedQuestions={selectedQuestions}
      onSuccess={handleSuccess}
    >
      <AssignQuizModalContent open={open} onOpenChange={onOpenChange} />
    </AssignQuizProvider>
  );
} 
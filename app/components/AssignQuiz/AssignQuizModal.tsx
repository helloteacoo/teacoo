"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Question } from '@/app/types/question';
import { AssignQuizProvider } from './AssignQuizContext';
import AssignQuizForm from './AssignQuizForm';
import AssignQuizSuccess from './AssignQuizSuccess';
import { useAssignQuiz } from './AssignQuizContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface AssignQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestions: Question[];
  mode?: 'assign' | 'practice';
}

function AssignQuizContent() {
  const { state, mode } = useAssignQuiz();
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <DialogHeader className="pb-2">
        <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {state.step === 'completed' 
            ? t(`assignQuiz.title.${mode === 'practice' ? 'practice' : 'assign'}`)
            : t(`assignQuiz.title.${mode === 'practice' ? 'practiceSetup' : 'assignSetup'}`)}
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
      <DialogContent className="max-w-[75vw] sm:max-w-sm bg-mainBg dark:bg-gray-900 dark:text-mainBg p-3 sm:p-4 rounded-xl border border-gray-300 dark:border-gray-700">
        <AssignQuizContent />
      </DialogContent>
    </Dialog>
  );
}

export default function AssignQuizModal({
  open,
  onOpenChange,
  selectedQuestions,
  mode = 'assign',
}: AssignQuizModalProps) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsPremium(userDoc.data()?.isPremium || false);
      }
    };
    checkPremiumStatus();
  }, [user]);

  return (
    <AssignQuizProvider 
      selectedQuestions={selectedQuestions}
      onSuccess={() => {}}
      mode={mode}
      isPremium={isPremium}
    >
      <AssignQuizModalContent open={open} onOpenChange={onOpenChange} />
    </AssignQuizProvider>
  );
} 
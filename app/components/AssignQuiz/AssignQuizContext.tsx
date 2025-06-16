"use client";

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question } from '@/app/types/question';
import { addDoc, getDoc } from 'firebase/firestore';

// 定義狀態類型
interface AssignQuizState {
  step: 'initial' | 'submitting' | 'completed' | 'error';
  error?: string;
  data: {
    id?: string;
    title: string;
    settings: {
      showTimer: boolean;
      targetList?: string[];
    };
  };
}

// 定義 Action 類型
type AssignQuizAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AssignQuizState['data']['settings'] }
  | { type: 'SET_STEP'; payload: AssignQuizState['step'] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_ID'; payload: string }
  | { type: 'RESET' };

// 定義 Context 類型
interface AssignQuizContextType {
  state: AssignQuizState;
  dispatch: React.Dispatch<AssignQuizAction>;
  handleSubmit: () => Promise<void>;
  selectedQuestions: Question[];
}

// 創建 Context
const AssignQuizContext = createContext<AssignQuizContextType | undefined>(undefined);

// 初始狀態
const initialState: AssignQuizState = {
  step: 'initial',
  data: {
    title: '',
    settings: {
      showTimer: false,
    },
  },
};

// Reducer
function assignQuizReducer(state: AssignQuizState, action: AssignQuizAction): AssignQuizState {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        data: {
          ...state.data,
          title: action.payload,
        },
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        data: {
          ...state.data,
          settings: action.payload,
        },
      };
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
        error: action.payload === 'error' ? state.error : undefined,
      };
    case 'SET_ERROR':
      return {
        ...state,
        step: 'error',
        error: action.payload,
      };
    case 'SET_ID':
      return {
        ...state,
        data: {
          ...state.data,
          id: action.payload,
        },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Provider Props
interface AssignQuizProviderProps {
  children: ReactNode;
  selectedQuestions?: Question[];
  onSuccess?: (quizId: string) => void;
}

// Provider 組件
export function AssignQuizProvider({
  children,
  selectedQuestions = [],
  onSuccess,
}: AssignQuizProviderProps) {
  const [state, dispatch] = useReducer(assignQuizReducer, initialState);

  const handleSubmit = async () => {
    try {
      if (!state.data.title) {
        dispatch({ type: 'SET_ERROR', payload: '請輸入作業名稱' });
        return;
      }
  
      dispatch({ type: 'SET_STEP', payload: 'submitting' });
  
      // 先確認每一題都有在 Firestore 中，如果沒有就寫入
      const questionIds: string[] = [];
  
      for (const q of selectedQuestions) {
        if (!q.id) {
          // 如果沒有 ID，就新增一筆並取得 ID
          const docRef = await addDoc(collection(db, 'questions'), q);
          questionIds.push(docRef.id);
        } else {
          // 如果有 ID，確認該題在 Firestore 中是否存在
          const docRef = doc(db, 'questions', q.id);
          const existing = await getDoc(docRef);
          if (existing.exists()) {
            questionIds.push(q.id);
          } else {
            // 若該 ID 只是 UUID，但題目實際未存入 Firebase，也新增一筆
            const newDoc = await addDoc(collection(db, 'questions'), { ...q });
            questionIds.push(newDoc.id);
          }
        }
      }
  
      // 建立 quiz
      const quizRef = doc(collection(db, 'quizzes'));
      const quizId = quizRef.id;
  
      await setDoc(quizRef, {
        title: state.data.title,
        settings: state.data.settings,
        questionIds, // ✅ 正確使用 Firebase doc.id
        createdAt: Timestamp.now(),
      });
  
      dispatch({ type: 'SET_ID', payload: quizId });
      dispatch({ type: 'SET_STEP', payload: 'completed' });
  
      onSuccess?.(quizId);
    } catch (error) {
      console.error('派發作業失敗:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '派發作業失敗，請稍後再試',
      });
    }
  };

  return (
    <AssignQuizContext.Provider value={{ state, dispatch, handleSubmit, selectedQuestions }}>
      {children}
    </AssignQuizContext.Provider>
  );
}

// Hook
export function useAssignQuiz() {
  const context = useContext(AssignQuizContext);
  if (context === undefined) {
    throw new Error('useAssignQuiz must be used within an AssignQuizProvider');
  }
  return context;
} 
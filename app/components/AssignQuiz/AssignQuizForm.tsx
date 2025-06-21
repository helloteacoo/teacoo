"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useAssignQuiz } from "./AssignQuizContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { getAllLists, addList, List } from '../../lib/firebase/lists';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'react-hot-toast';
import { auth } from '../../lib/firebase/firebase';
import { useAuth } from '@/lib/contexts/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firebase';
import { useTranslation } from 'react-i18next';

export default function AssignQuizForm() {
  const { t } = useTranslation();
  const { state, dispatch, handleSubmit, selectedQuestions, mode } = useAssignQuiz();
  const [submitting, setSubmitting] = useState(false);
  const [useTargetList, setUseTargetList] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [newListStudents, setNewListStudents] = useState("");
  const [createNewList, setCreateNewList] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  // 正確取得已選題目數量
  const selectedCount = selectedQuestions ? selectedQuestions.length : 0;

  // 檢查使用者是否為付費版
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsPremium(userDoc.data()?.isPremium || false);
      }
    };
    checkPremiumStatus();
  }, [user]);

  useEffect(() => {
    if (useTargetList && mode === 'assign' && !isPremium) {
      toast.error(t('assignQuiz.messages.premiumFeature'));
      setUseTargetList(false);
    } else if (useTargetList && mode === 'assign') {
      getAllLists().then(setLists);
    }
  }, [useTargetList, mode, isPremium, t]);

  // 檢查使用者登入狀態
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && createNewList) {
        toast.error(t('assignQuiz.messages.loginRequired'));
        setCreateNewList(false);
      }
    });

    return () => unsubscribe();
  }, [createNewList, t]);

  // 檢查回應人數限制
  const checkResponseLimit = () => {
    const targetList = state.data.settings.targetList || [];
    const maxResponses = isPremium ? 100 : 10;
    
    if (targetList.length > maxResponses) {
      toast.error(t(`assignQuiz.messages.responseLimit.${isPremium ? 'premium' : 'free'}`));
      return false;
    }
    return true;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_TITLE", payload: e.target.value });
  };

  const handleShowTimerChange = (checked: boolean) => {
    dispatch({
      type: "SET_SETTINGS",
      payload: {
        ...state.data.settings,
        showTimer: checked,
      },
    });
  };

  // 建立新名單
  const handleCreateList = async () => {
    if (!isPremium) {
      toast.error(t('assignQuiz.messages.premiumFeature'));
      return;
    }
    
    if (!newListName.trim() || !newListStudents.trim()) {
      toast.error(t('assignQuiz.messages.listNameRequired'));
      return;
    }
    
    if (!auth.currentUser) {
      toast.error(t('assignQuiz.messages.loginRequired'));
      return;
    }

    setCreatingList(true);
    const students = newListStudents.split('\n').map(s => s.trim()).filter(Boolean);
    
    try {
      const listId = await addList({
        name: newListName,
        students,
        owner: auth.currentUser.uid,
      });
      
      if (!listId) {
        throw new Error(t('assignQuiz.messages.createListError'));
      }

      const newList = { 
        id: listId, 
        name: newListName, 
        students, 
        createdAt: new Date(), 
        owner: auth.currentUser.uid 
      };
      
      setLists(prev => [...prev, newList]);
      setSelectedListId(listId);
      
      dispatch({
        type: "SET_SETTINGS",
        payload: {
          ...state.data.settings,
          targetList: students
        }
      });
      
      setNewListName("");
      setNewListStudents("");
      setCreateNewList(false);
      toast.success(t('assignQuiz.messages.createListSuccess'));
    } catch (error) {
      toast.error(t('assignQuiz.messages.createListError') + (error instanceof Error ? error.message : ''));
    } finally {
      setCreatingList(false);
    }
  };

  // 當選擇現有名單時
  const handleListSelect = async (listId: string) => {
    setSelectedListId(listId);
    const selectedList = lists.find(list => list.id === listId);
    if (selectedList) {
      dispatch({
        type: "SET_SETTINGS",
        payload: {
          ...state.data.settings,
          targetList: selectedList.students
        }
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createNewList) {
      // 如果是在建立名單模式，不要提交表單
      return;
    }

    // 檢查回應人數限制
    if (!checkResponseLimit()) {
      return;
    }

    setSubmitting(true);
    await handleSubmit();
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {t(mode === 'practice' ? 'assignQuiz.form.practiceTitle' : 'assignQuiz.form.assignmentTitle')}
        </label>
        <Input
          value={state.data.title}
          className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
          onChange={handleTitleChange}
          placeholder={t(`assignQuiz.form.titlePlaceholder.${mode}`)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={state.data.settings.showTimer}
          onCheckedChange={handleShowTimerChange}
          id="show-timer-switch"
        />
        <label htmlFor="show-timer-switch" className="text-sm text-gray-700 dark:text-gray-300">
          {t('assignQuiz.form.showTimer')}
        </label>
      </div>
      
      {/* 只在派發作業模式下顯示名單相關功能 */}
      {mode === 'assign' && (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-target-list"
              checked={useTargetList}
              onCheckedChange={checked => {
                if (!isPremium && checked) {
                  toast.error(t('assignQuiz.messages.premiumFeature'));
                  return;
                }
                setUseTargetList(!!checked);
                if (!checked) {
                  // 如果取消使用名單，清空 targetList
                  dispatch({
                    type: "SET_SETTINGS",
                    payload: {
                      ...state.data.settings,
                      targetList: []
                    }
                  });
                }
              }}
            />
            <label htmlFor="use-target-list" className="text-sm select-none text-gray-700 dark:text-gray-300">
              {t('assignQuiz.form.targetList.enable')}
            </label>
            {!isPremium && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('assignQuiz.form.targetList.premiumOnly')}
              </span>
            )}
          </div>
          {useTargetList && isPremium && (
            <div className="space-y-3 border rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-new-list"
                  checked={createNewList}
                  onCheckedChange={checked => {
                    setCreateNewList(!!checked);
                    if (checked) {
                      // 如果切換到建立新名單，清空已選擇的名單
                      setSelectedListId("");
                      dispatch({
                        type: "SET_SETTINGS",
                        payload: {
                          ...state.data.settings,
                          targetList: []
                        }
                      });
                    }
                  }}
                />
                <label htmlFor="create-new-list" className="text-sm select-none text-gray-700 dark:text-gray-300">
                  {t('assignQuiz.form.targetList.createNew')}
                </label>
              </div>
              {!createNewList ? (
                <div>
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                    {t('assignQuiz.form.targetList.selectList')}
                  </label>
                  <Select value={selectedListId} onValueChange={handleListSelect}>
                    <SelectTrigger className="bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue placeholder={t('assignQuiz.form.targetList.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                      {lists.map(list => (
                        <SelectItem key={list.id} value={list.id!}>{list.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block mb-1 text-xs text-gray-700 dark:text-gray-300">
                    {t('assignQuiz.form.targetList.newListName')}
                  </label>
                  <Input 
                    value={newListName} 
                    onChange={e => setNewListName(e.target.value)} 
                    placeholder={t('assignQuiz.form.targetList.newListNamePlaceholder')}
                    className="text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  />
                  <label className="block mb-1 text-xs text-gray-700 dark:text-gray-300">
                    {t('assignQuiz.form.targetList.studentNames')}
                  </label>
                  <textarea
                    className="w-full border rounded p-2 min-h-[60px] text-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                    value={newListStudents}
                    onChange={e => setNewListStudents(e.target.value)}
                    placeholder={t('assignQuiz.form.targetList.studentNamesPlaceholder')}
                  />
                  <Button
                    type="button"
                    onClick={handleCreateList}
                    disabled={creatingList || !newListName.trim() || !newListStudents.trim()}
                    className="w-full"
                  >
                    {creatingList ? t('assignQuiz.form.targetList.creating') : t('assignQuiz.form.targetList.create')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
      >
        {submitting 
          ? t('assignQuiz.form.submit.processing')
          : t(`assignQuiz.form.submit.${mode}`)}
      </Button>
    </form>
  );
} 
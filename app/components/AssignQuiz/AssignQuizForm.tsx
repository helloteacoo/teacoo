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

export default function AssignQuizForm() {
  const { state, dispatch, handleSubmit, selectedQuestions, mode } = useAssignQuiz();
  const [submitting, setSubmitting] = useState(false);
  const [useTargetList, setUseTargetList] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [newListStudents, setNewListStudents] = useState("");
  const [createNewList, setCreateNewList] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

  // 正確取得已選題目數量
  const selectedCount = selectedQuestions ? selectedQuestions.length : 0;

  useEffect(() => {
    if (useTargetList && mode === 'assign') {
      getAllLists().then(setLists);
    }
  }, [useTargetList, mode]);

  // 檢查使用者登入狀態
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && createNewList) {
        toast.error('請先登入才能建立名單');
        setCreateNewList(false);
      }
    });

    return () => unsubscribe();
  }, [createNewList]);

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
    console.log('開始建立名單');
    if (!newListName.trim() || !newListStudents.trim()) {
      console.log('名單名稱或學生名單為空');
      toast.error('請填寫名單名稱和學生名單');
      return;
    }
    
    if (!auth.currentUser) {
      console.log('使用者未登入');
      toast.error('請先登入');
      return;
    }

    console.log('準備建立名單:', { newListName, studentsCount: newListStudents.split('\n').length });
    setCreatingList(true);
    const students = newListStudents.split('\n').map(s => s.trim()).filter(Boolean);
    
    try {
      console.log('呼叫 addList API');
      const listId = await addList({
        name: newListName,
        students,
        owner: auth.currentUser.uid,
      });
      
      if (!listId) {
        console.error('建立名單失敗: 未收到 listId');
        throw new Error('建立名單失敗');
      }

      console.log('名單建立成功:', listId);
      const newList = { 
        id: listId, 
        name: newListName, 
        students, 
        createdAt: new Date(), 
        owner: auth.currentUser.uid 
      };
      
      setLists(prev => [...prev, newList]);
      setSelectedListId(listId);
      
      // 更新 settings 中的 targetList
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
      toast.success('名單建立成功！');
    } catch (error) {
      console.error('建立名單失敗:', error);
      toast.error('建立名單失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
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
    setSubmitting(true);
    await handleSubmit();
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-100">
          {mode === 'practice' ? '練習標題' : '作業標題'}
        </label>
        <Input
          value={state.data.title}
          className="w-full text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
          onChange={handleTitleChange}
          placeholder={mode === 'practice' ? '請輸入練習名稱' : '請輸入作業名稱'}
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
          顯示計時器
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
              是否啟用名單
            </label>
          </div>
          {useTargetList && (
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
                  建立名單
                </label>
              </div>
              {!createNewList ? (
                <div>
                  <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">選擇名單</label>
                  <Select value={selectedListId} onValueChange={handleListSelect}>
                    <SelectTrigger className="bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue placeholder="請選擇名單" />
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
                  <label className="block mb-1 text-xs text-gray-700 dark:text-gray-300">新名單名稱</label>
                  <Input 
                    value={newListName} 
                    onChange={e => setNewListName(e.target.value)} 
                    placeholder="例如：八年級 B 班"
                    className="text-sm placeholder:text-gray-400 dark:placeholder:text-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  />
                  <label className="block mb-1 text-xs text-gray-700 dark:text-gray-300">學生姓名（每行一位）</label>
                  <textarea
                    className="w-full border rounded p-2 min-h-[60px] text-sm bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                    value={newListStudents}
                    onChange={e => setNewListStudents(e.target.value)}
                    placeholder="請輸入學生姓名，每行一位"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateList();
                    }}
                    disabled={creatingList || !newListName.trim() || !newListStudents.trim()}
                    className="w-full"
                  >
                    {creatingList ? '建立中...' : '建立名單'}
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
        {submitting ? '處理中...' : (mode === 'practice' ? '開始作答' : '派發作業')}
      </Button>
    </form>
  );
} 
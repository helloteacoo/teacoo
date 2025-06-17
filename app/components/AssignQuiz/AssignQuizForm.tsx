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

export default function AssignQuizForm() {
  const { state, dispatch, handleSubmit, selectedQuestions } = useAssignQuiz();
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
    if (useTargetList) {
      getAllLists().then(setLists);
    }
  }, [useTargetList]);

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
    if (!newListName.trim() || !newListStudents.trim()) return;
    setCreatingList(true);
    const students = newListStudents.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      const listId = await addList({
        name: newListName,
        students,
        owner: "teacherUid", // TODO: 改成實際老師 uid
      });
      const newList = { id: listId, name: newListName, students, createdAt: new Date(), owner: "teacherUid" };
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
    } catch (e) {
      toast.error('名單建立失敗');
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
    setSubmitting(true);
    // 這裡之後會補上派發名單的邏輯
    await handleSubmit();
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-medium text-gray-800 dark:text-gray-100">作業標題</label>
        <Input
          value={state.data.title}
          className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-400 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
          onChange={handleTitleChange}
          placeholder="請輸入作業名稱"
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
        <div className="space-y-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
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
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">新名單名稱</label>
              <Input 
                value={newListName} 
                onChange={e => setNewListName(e.target.value)} 
                placeholder="例如：八年級 B 班"
                className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">學生姓名（每行一位）</label>
              <textarea
                className="w-full border rounded p-2 min-h-[80px] text-sm bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={newListStudents}
                onChange={e => setNewListStudents(e.target.value)}
                placeholder="請輸入學生姓名，每行一位"
              />
              <Button 
                type="button" 
                onClick={handleCreateList} 
                disabled={creatingList || !newListName.trim() || !newListStudents.trim()} 
                className="w-full bg-primary hover:bg-primary/80 dark:bg-primary dark:hover:bg-primary/80"
              >
                {creatingList ? '建立中...' : '建立名單'}
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        已選題數：<span className="font-bold">{selectedCount}</span>
      </div>
      {state.step === "error" && (
        <div className="text-red-500 dark:text-red-400 text-sm">{state.error}</div>
      )}
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/80 dark:bg-primary dark:hover:bg-primary/80 sm:text-base" 
        disabled={submitting || !state.data.title.trim()}
      >
        {submitting ? "派發中..." : "立即派發"}
      </Button>
    </form>
  );
} 
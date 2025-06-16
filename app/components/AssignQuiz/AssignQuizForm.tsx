"use client";

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useAssignQuiz } from "./AssignQuizContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { getAllLists, addList, List } from '../../lib/firebase/lists';
import { Checkbox } from '../ui/checkbox';

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
      setLists(prev => [...prev, { id: listId, name: newListName, students, createdAt: new Date(), owner: "teacherUid" }]);
      setSelectedListId(listId);
      setNewListName("");
      setNewListStudents("");
      setCreateNewList(false);
      alert('名單建立成功！');
    } catch (e) {
      alert('名單建立失敗');
    } finally {
      setCreatingList(false);
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
        <label className="block mb-1 font-medium">作業標題</label>
        <Input
          value={state.data.title}
          className="placeholder:text-gray-400 dark:placeholder:text-gray-400 bg-mainBg dark:bg-gray-800"
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
        <label htmlFor="show-timer-switch" className="text-sm">
          顯示計時器
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="use-target-list"
          checked={useTargetList}
          onCheckedChange={checked => setUseTargetList(!!checked)}
        />
        <label htmlFor="use-target-list" className="text-sm select-none">
          是否啟用名單
        </label>
      </div>
      {useTargetList && (
        <div className="space-y-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-new-list"
              checked={createNewList}
              onCheckedChange={checked => setCreateNewList(!!checked)}
            />
            <label htmlFor="create-new-list" className="text-sm select-none">
              建立名單
            </label>
          </div>
          {!createNewList ? (
            <div>
              <label className="block mb-1 text-sm">選擇名單</label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger className="bg-mainBg shadow-none hover:bg-gray-100 dark:hover:bg-gray-700">
                  <SelectValue placeholder="請選擇名單" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map(list => (
                    <SelectItem key={list.id} value={list.id!}>{list.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block mb-1 text-sm">新名單名稱</label>
              <Input value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="例如：八年級 B 班" />
              <label className="block mb-1 text-sm">學生姓名（每行一位）</label>
              <textarea
                className="w-full border rounded p-2 min-h-[80px] text-sm"
                value={newListStudents}
                onChange={e => setNewListStudents(e.target.value)}
                placeholder="請輸入學生姓名，每行一位"
              />
              <Button type="button" onClick={handleCreateList} disabled={creatingList || !newListName.trim() || !newListStudents.trim()} className="w-full">
                {creatingList ? '建立中...' : '建立名單'}
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        已選題目數量：<span className="font-bold">{selectedCount}</span>
      </div>
      {state.step === "error" && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}
      <Button type="submit" className="w-full" disabled={submitting || !state.data.title.trim()}>
        {submitting ? "派發中..." : "立即派發"}
      </Button>
    </form>
  );
} 
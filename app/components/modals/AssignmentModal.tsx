"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import { Question } from '@/app/types/question';
import AssignmentSuccessModal from './AssignmentSuccessModal';
import CreateListModal from './CreateListModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface StudentList {
  id: string;
  name: string;
  students: string[];
}

interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestions: Question[];
  isPremium?: boolean;
}

export default function AssignmentModal({
  open,
  onOpenChange,
  selectedQuestions,
  isPremium = false
}: AssignmentModalProps) {
  // 強制設定為付費版本
  isPremium = true;
  
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'none' | 'list'>('none');
  const [hideTimer, setHideTimer] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [studentLists, setStudentLists] = useState<StudentList[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      // 重置表單
      setTitle('');
      setTargetType('none');
      setHideTimer(true);
      setShowTimer(false);
      setSelectedListId('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!title) {
      alert('請填寫作業名稱');
      return;
    }

    // TODO: 實作派發作業的邏輯
    const assignmentData = {
      title,
      targetType,
      targetListId: targetType === 'list' ? selectedListId : null,
      hideTimer,
      showTimer,
      selectedQuestions
    };

    console.log('派發作業：', assignmentData);

    // 模擬 API 回應
    setShortUrl('https://teacoo.app/q/abc123');
    setShowSuccessModal(true);
    onOpenChange(false);
  };

  const handleSuccessModalChange = (open: boolean) => {
    setShowSuccessModal(open);
  };

  const handleCreateListModalChange = (open: boolean) => {
    setShowCreateListModal(open);
  };

  const handleCreateList = (data: { name: string; students: string[] }) => {
    const newList: StudentList = {
      id: `list-${Date.now()}`,
      name: data.name,
      students: data.students
    };
    setStudentLists(prev => [...prev, newList]);
    setSelectedListId(newList.id);
  };

  const isSubmitDisabled = !title || (targetType === 'list' && !selectedListId);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-cardBg dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              📘 派發作業
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {/* 作業名稱 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">
                作業名稱（必填）
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 placeholder:text-gray-400"
                placeholder="請輸入作業名稱..."
              />
            </div>

            {/* 指定對象 */}
            <div className="space-y-4">
              <Label className="text-gray-700 dark:text-gray-300">指定對象</Label>
              <RadioGroup value={targetType} onValueChange={(value) => setTargetType(value as 'none' | 'list')} className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="text-gray-700 dark:text-gray-300">不指定</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="list" />
                  <Label 
                    htmlFor="list" 
                    className="text-gray-700 dark:text-gray-300"
                  >
                    已建立名單
                  </Label>
                  {targetType === 'list' && (
                    <div className="flex items-center space-x-2 ml-2">
                      <Select value={selectedListId} onValueChange={setSelectedListId}>
                        <SelectTrigger className="w-[120px] h-8 text-sm bg-white dark:bg-gray-700 text-gray-400">
                          <SelectValue placeholder="選擇名單" />
                        </SelectTrigger>
                        <SelectContent>
                          {studentLists.map(list => (
                            <SelectItem key={list.id} value={list.id} className="text-sm">
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => setShowCreateListModal(true)}
                        className="text-sm h-8 px-2 bg-primary text-mainBg hover:bg-primary/90"
                      >
                        ➕ 建立
                      </Button>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* 計時器設定 */}
            <div className="space-y-4">
              <Label className="text-gray-700 dark:text-gray-300">計時器設定</Label>
              <RadioGroup 
                value={hideTimer ? "hide" : (showTimer ? "show" : "hide")} 
                onValueChange={(value) => {
                  if (value === "hide") {
                    setHideTimer(true);
                    setShowTimer(false);
                  } else {
                    setHideTimer(false);
                    setShowTimer(true);
                  }
                }}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hide" id="hideTimer" />
                  <Label htmlFor="hideTimer" className="text-gray-700 dark:text-gray-300">
                    隱藏計時器
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="show" id="showTimer" />
                  <Label htmlFor="showTimer" className="text-gray-700 dark:text-gray-300">
                    顯示計時器
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 已選擇題目數量和派發按鈕 */}
            <div className="flex justify-between items-center">
              <Label className="text-gray-700 dark:text-gray-300">
                共 {selectedQuestions.length} 題
              </Label>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
              >
                📤 派發
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssignmentSuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessModalChange}
        shortUrl={shortUrl}
      />

      <CreateListModal
        open={showCreateListModal}
        onOpenChange={handleCreateListModalChange}
        onSubmit={handleCreateList}
      />
    </>
  );
} 
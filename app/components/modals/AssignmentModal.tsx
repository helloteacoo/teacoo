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
  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("23");
  const [minute, setMinute] = useState("59");
  const [noDeadline, setNoDeadline] = useState(true);
  const [targetType, setTargetType] = useState<'none' | 'list'>('none');
  const [hideTimer, setHideTimer] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [randomQuestionOrder, setRandomQuestionOrder] = useState(false);
  const [randomOptionOrder, setRandomOptionOrder] = useState(false);
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
      setDate(undefined);
      setHour("23");
      setMinute("59");
      setNoDeadline(true);
      setTargetType('none');
      setHideTimer(true);
      setShowTimer(false);
      setRandomQuestionOrder(false);
      setRandomOptionOrder(false);
      setSelectedListId('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!title) {
      alert('請填寫作業名稱');
      return;
    }

    let deadline = null;
    if (!noDeadline && date) {
      deadline = new Date(date);
      deadline.setHours(parseInt(hour), parseInt(minute));
    }

    // TODO: 實作派發作業的邏輯
    const assignmentData = {
      title,
      deadline,
      targetType,
      targetListId: targetType === 'list' ? selectedListId : null,
      hideTimer,
      showTimer,
      randomQuestionOrder,
      randomOptionOrder,
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

            {/* 截止時間 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noDeadline"
                  checked={noDeadline}
                  onCheckedChange={(checked) => setNoDeadline(checked as boolean)}
                />
                <Label htmlFor="noDeadline" className="text-gray-700 dark:text-gray-300">
                  不指定截止時間
                </Label>
              </div>
              
              {!noDeadline && (
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[180px] justify-start text-left font-normal bg-white dark:bg-gray-700",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: zhTW }) : "選擇截止日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-700 border dark:border-gray-600" align="start">
                      <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3"
                        showOutsideDays={false}
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
                          nav: "flex items-center absolute left-0 right-0 justify-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex items-center justify-center",
                          nav_button_previous: "absolute -translate-x-[150%]",
                          nav_button_next: "absolute translate-x-[150%]",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm relative p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus-within:relative focus-within:z-20 transition-colors",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground dark:text-white",
                          day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                          day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
                          day_disabled: "text-gray-400 dark:text-gray-500 opacity-50 hover:bg-transparent",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                        formatters={{ 
                          formatCaption: (date) => format(date, "yyyy年 MM月", { locale: zhTW })
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <Select value={hour} onValueChange={setHour}>
                      <SelectTrigger className="w-[70px] h-8 bg-white dark:bg-gray-700">
                        <SelectValue placeholder="時" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700">
                        {Array.from({length: 24}, (_, i) => 
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <span className="text-gray-500">:</span>
                    <Select value={minute} onValueChange={setMinute}>
                      <SelectTrigger className="w-[70px] h-8 bg-white dark:bg-gray-700">
                        <SelectValue placeholder="分" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700">
                        {Array.from({length: 60}, (_, i) => 
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
                        variant="outline"
                        className="whitespace-nowrap text-sm h-8 px-2 bg-primary text-white hover:bg-primary/90"
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

            {/* 隨機設定 */}
            <div className="space-y-4">
              <Label className="text-gray-700 dark:text-gray-300">隨機設定</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="randomQuestionOrder"
                    checked={randomQuestionOrder}
                    onCheckedChange={(checked) => setRandomQuestionOrder(checked as boolean)}
                  />
                  <Label 
                    htmlFor="randomQuestionOrder" 
                    className="text-gray-700 dark:text-gray-300"
                  >
                    題目順序隨機
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="randomOptionOrder"
                    checked={randomOptionOrder}
                    onCheckedChange={(checked) => setRandomOptionOrder(checked as boolean)}
                  />
                  <Label 
                    htmlFor="randomOptionOrder" 
                    className="text-gray-700 dark:text-gray-300"
                  >
                    選項順序隨機（限選擇題）
                  </Label>
                </div>
              </div>
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
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; students: string[] }) => void;
}

export default function CreateListModal({
  open,
  onOpenChange,
  onSubmit
}: CreateListModalProps) {
  const [name, setName] = useState('');
  const [studentsText, setStudentsText] = useState('');

  const handleSubmit = () => {
    if (!name || !studentsText.trim()) {
      alert('請填寫名單名稱和學生名單');
      return;
    }

    const students = studentsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    onSubmit({ name, students });
    onOpenChange(false);

    // 重置表單
    setName('');
    setStudentsText('');
  };

  const isSubmitDisabled = !name || !studentsText.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-cardBg dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            建立新名單
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 名單名稱 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              名單名稱（必填）
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 text-gray-400"
              placeholder="請輸入名單名稱..."
            />
          </div>

          {/* 學生名單 */}
          <div className="space-y-2">
            <Label htmlFor="students" className="text-gray-700 dark:text-gray-300">
              學生名單（必填）
            </Label>
            <Textarea
              id="students"
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
              className="min-h-[200px] bg-white dark:bg-gray-700 text-gray-400"
              placeholder="一行一位學生姓名，可複製貼上"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
          >
            💾 儲存並套用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
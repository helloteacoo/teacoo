"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { QRCodeSVG } from 'qrcode.react';

interface AssignmentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortUrl: string;
}

export default function AssignmentSuccessModal({
  open,
  onOpenChange,
  shortUrl,
}: AssignmentSuccessModalProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  const handlePreview = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-cardBg dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            ✅ 派發成功！
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">以下方式進入作業：</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 dark:text-gray-300">📎 短網址：</span>
              <span className="text-blue-600 dark:text-blue-400">{shortUrl}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={shortUrl} size={200} />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCopyUrl}
              className="text-mainBg bg-primary hover:bg-primary/90 dark:text-mainBg dark:bg-primary dark:hover:bg-primary/90"
            >
              📋 複製網址
            </Button>
            <Button
              onClick={handlePreview}
              variant="outline"
              className="text-mainBg bg-primary hover:bg-primary/90 dark:text-mainBg dark:bg-primary dark:hover:bg-primary/90"
            >
              👁️ 開啟預覽
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
// components/modals/ConfirmDeleteModal.tsx
import * as React from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[400px] shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">
            確認刪除
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-gray-600">
            確定要刪除選中的題目嗎？此操作無法復原。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              確認刪除
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

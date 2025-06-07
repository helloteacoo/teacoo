// components/modals/ConfirmDeleteModal.tsx
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ open, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[360px]">
        <h2 className="text-lg font-semibold mb-4">你確定要刪除這些題目？</h2>
        <p className="text-sm text-gray-600 mb-6">此動作無法復原</p>
        <div className="flex justify-end gap-4">
          <Button variant="default" onClick={onConfirm}>
            確定
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

// components/modals/ConfirmDeleteModal.tsx
import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-mainBg dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-800 dark:text-gray-200">
            {t('deleteModal.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            {t('deleteModal.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => onOpenChange(false)}
            className="bg-transparent dark:hover:bg-gray-700 text-gray-800 dark:text-mainBg"
          >
            {t('deleteModal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t('deleteModal.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

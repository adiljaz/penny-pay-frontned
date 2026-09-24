import { type ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  details?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  details,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              confirmVariant === 'danger' ? 'bg-pp-error-soft' : 'bg-pp-accent-soft'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${confirmVariant === 'danger' ? 'text-pp-error' : 'text-pp-accent'}`}
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-pp-text">{description}</p>
          {details && (
            <div className="mt-3 p-3 bg-pp-bg-soft border border-pp-border rounded-lg text-xs space-y-1.5">
              {details}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

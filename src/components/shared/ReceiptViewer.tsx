import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FileText, Image as ImageIcon, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { Receipt } from '@/types';
import { formatDateTime } from '@/utils/format';

interface ReceiptViewerProps {
  receipt: Receipt;
  trigger?: React.ReactNode;
}

export function ReceiptViewer({ receipt, trigger }: ReceiptViewerProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receipt.url;
    link.download = receipt.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdf = receipt.fileType === 'pdf';

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer inline-flex">
        {trigger || (
          <Button variant="outline" size="sm" icon={isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}>
            View Receipt
          </Button>
        )}
      </span>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setZoom(1);
          setRotation(0);
        }}
        title="Payment Receipt"
        size="xl"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
            <Button variant="primary" size="md" onClick={() => {
              setOpen(false);
              setZoom(1);
              setRotation(0);
            }}>
              Close
            </Button>
          </>
        }
      >
        {/* Receipt metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-pp-border">
          <div>
            <p className="text-xs text-pp-text-muted mb-0.5">Filename</p>
            <p className="text-sm font-medium text-pp-text truncate">{receipt.filename}</p>
          </div>
          <div>
            <p className="text-xs text-pp-text-muted mb-0.5">File Type</p>
            <p className="text-sm font-medium text-pp-text uppercase">{receipt.mimeType.split('/')[1]}</p>
          </div>
          <div>
            <p className="text-xs text-pp-text-muted mb-0.5">File Size</p>
            <p className="text-sm font-medium text-pp-text">{receipt.fileSize}</p>
          </div>
          <div>
            <p className="text-xs text-pp-text-muted mb-0.5">Uploaded</p>
            <p className="text-sm font-medium text-pp-text">{formatDateTime(receipt.uploadedAt)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-pp-text-muted mb-1">Uploaded by</p>
          <p className="text-sm font-medium text-pp-text mb-4">{receipt.uploadedBy}</p>
        </div>

        {/* Receipt preview */}
        <div className="bg-pp-bg-soft border border-pp-border rounded-lg overflow-hidden relative">
          {!isPdf && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 bg-white border border-pp-border rounded-lg hover:bg-pp-bg-soft transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-pp-text" />
              </button>
              <span className="text-xs font-medium text-pp-text-secondary bg-white px-2 py-1 rounded border border-pp-border tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 bg-white border border-pp-border rounded-lg hover:bg-pp-bg-soft transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-pp-text" />
              </button>
              <button
                onClick={() => setRotation((r) => r + 90)}
                className="p-2 bg-white border border-pp-border rounded-lg hover:bg-pp-bg-soft transition-colors"
                aria-label="Rotate"
              >
                <RotateCw className="w-4 h-4 text-pp-text" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-center p-4 min-h-[400px] max-h-[600px] overflow-auto pp-scroll">
            {isPdf ? (
              <iframe
                src={receipt.url}
                title="Receipt PDF"
                className="w-full h-[500px] border-0"
              />
            ) : (
              <img
                src={receipt.url}
                alt={receipt.filename}
                className="max-w-full transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            )}
          </div>
        </div>

        <p className="text-xs text-pp-text-muted mt-4 italic">
          This receipt is evidence of payment. Verify the actual payment externally before confirming.
        </p>
      </Modal>
    </>
  );
}

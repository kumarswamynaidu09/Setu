import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  classNameTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  classNameTitle
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl = `${window.location.origin}/#join?code=${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center text-zinc-900 dark:text-zinc-100">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close QR Modal"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-5 h-5 text-red-500" />
        </div>

        <div className="nothing-label text-xs text-zinc-400">[ LIVE CLASSROOM ACCESS ]</div>
        <h3 id="qr-modal-title" className="text-xl font-bold font-heading mt-1">
          Scan to Connect
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {classNameTitle}
        </p>

        {/* QR Code Container with micro-border */}
        <div className="p-4 bg-white rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xs inline-block my-5">
          <QRCodeSVG
            value={joinUrl}
            size={190}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Big Room Code Display in Space Mono */}
        <div className="bg-zinc-100 dark:bg-zinc-800/80 p-4 rounded-2xl mb-6 border border-zinc-200/60 dark:border-zinc-700/60">
          <div className="nothing-label text-[10px] text-zinc-400 tracking-wider">
            ROOM CODE // NO REGISTRATION NEEDED
          </div>
          <div className="text-3xl font-mono font-bold text-zinc-950 dark:text-zinc-50 tracking-widest mt-1 select-all">
            {roomCode}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'LINK COPIED' : 'COPY LINK'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 nothing-btn-primary font-mono text-xs font-bold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

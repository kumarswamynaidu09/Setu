import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Monitor } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center text-slate-900 dark:text-slate-100">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close QR Modal"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 id="qr-modal-title" className="text-xl font-black">
          Join Live Classroom
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {classNameTitle}
        </p>

        {/* QR Code Container */}
        <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-inner inline-block my-6">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Big Room Code Display */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl mb-6">
          <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            Room Code
          </div>
          <div className="text-3xl font-mono font-black text-blue-900 dark:text-blue-300 tracking-widest mt-1 select-all">
            {roomCode}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Join Link'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

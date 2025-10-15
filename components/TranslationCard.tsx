import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface TranslationCardProps {
  language: string;
  text: string;
  onTextChange?: (text: string) => void;
  isInput: boolean;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  isRecording?: boolean;
  isConnecting?: boolean;
  onToggleRecording?: () => void;
}

const TranslationCard: React.FC<TranslationCardProps> = ({
  language,
  text,
  onTextChange,
  isInput,
  isLoading = false,
  error = null,
  placeholder = '',
  isRecording = false,
  isConnecting = false,
  onToggleRecording,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
    }
  };

  const cardBaseClasses = "bg-slate-800 border border-slate-700 rounded-lg shadow-lg flex flex-col transition-all duration-300 h-full min-h-[250px] sm:min-h-[300px]";

  return (
    <div className={cardBaseClasses}>
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="font-semibold text-slate-300">{language}</h2>
        {!isInput && (
          <button
            onClick={handleCopy}
            disabled={!text || isCopied}
            className="p-2 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-400"
            aria-label="Copy to clipboard"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
          </button>
        )}
      </div>
      <div className="p-4 flex-grow relative">
        {isInput ? (
          <textarea
            value={text}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-200 placeholder-slate-500"
            readOnly={isRecording || isConnecting}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto text-slate-200">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-50">
                <div className="w-8 h-8 border-4 border-t-cyan-400 border-r-cyan-400 border-b-cyan-400 border-l-slate-600 rounded-full animate-spin"></div>
              </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
            {!isLoading && !error && text && <p className="whitespace-pre-wrap">{text}</p>}
            {!isLoading && !error && !text && <p className="text-slate-500">Translation will appear here.</p>}
          </div>
        )}
      </div>
      {isInput && (
        <div className="p-2 border-t border-slate-700 flex justify-end items-center">
            <button
                onClick={onToggleRecording}
                disabled={isConnecting}
                className={`p-2 rounded-full transition-all flex items-center justify-center w-9 h-9 ${
                    isRecording 
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-wait`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-t-white border-r-white border-b-white border-l-slate-400 rounded-full animate-spin"></div>
                ) : (
                    <MicrophoneIcon className="w-5 h-5" />
                )}
            </button>
        </div>
      )}
    </div>
  );
};

export default TranslationCard;

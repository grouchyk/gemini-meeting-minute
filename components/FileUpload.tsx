import React, { useRef } from 'react';
import { InputType } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  inputType: InputType;
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ inputType, onFileSelect, file }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    } else {
      onFileSelect(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const acceptedFormats = inputType === InputType.Audio ? 'audio/*' : '.txt,.md,.rtf';
  const promptText = inputType === InputType.Audio ? 'Click to select an audio file' : 'Click to select a text file';

  return (
    <div className="mt-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFormats}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300"
      >
        <UploadIcon className="w-10 h-10 text-slate-500 mb-3" />
        <p className="text-slate-400 font-semibold">{promptText}</p>
        <p className="text-xs text-slate-500 mt-1">
          {inputType === InputType.Audio ? '(e.g., .mp3, .wav, .m4a)' : '(e.g., .txt, .md)'}
        </p>
      </div>
      {file && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-center">
          <p className="text-sm font-medium text-cyan-300 truncate">
            Selected: <span className="text-slate-300">{file.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

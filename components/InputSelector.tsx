import React from 'react';
import { InputType } from '../types';

interface InputSelectorProps {
  selectedType: InputType;
  onTypeChange: (type: InputType) => void;
}

const SelectorButton = ({ type, label, selectedType, onClick }: { type: InputType, label: string, selectedType: InputType, onClick: (type: InputType) => void }) => {
  const isSelected = selectedType === type;
  return (
    <button
      onClick={() => onClick(type)}
      className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500
        ${isSelected ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
    >
      {label}
    </button>
  );
};

export const InputSelector: React.FC<InputSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="mt-2 flex bg-slate-900/70 rounded-xl p-1 space-x-1 border border-slate-700">
       <SelectorButton 
        type={InputType.Audio}
        label="Audio File"
        selectedType={selectedType}
        onClick={onTypeChange}
      />
      <SelectorButton 
        type={InputType.Text}
        label="Text Transcript"
        selectedType={selectedType}
        onClick={onTypeChange}
      />
    </div>
  );
};
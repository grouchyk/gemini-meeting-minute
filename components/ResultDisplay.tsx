import React, { useState, useEffect } from 'react';
import { Loader } from './Loader';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface ResultDisplayProps {
  minutes: string;
  isLoading: boolean;
  error: string;
  loadingMessage: string;
}

const formatMarkdown = (text: string) => {
    return text
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-cyan-300">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-slate-200">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-300">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>')
        
        // Process lists
        .replace(/\n- (.*)/g, '\n<li class="ml-5 list-disc">$1</li>')
        .replace(/<li>/g, '<li class="mb-2">') // Add space between list items
        .replace(/(\n<li.*>[\s\S]*?<\/li>)/g, '<ul class="my-4">$1</ul>') // Add space around the whole list
        .replace(/<\/ul>\s?<ul>/g, '')
        
        // Process numbered lists
        .replace(/\n(\d+)\. (.*)/g, '\n<li class="ml-5 list-decimal" value="$1">$2</li>')
        .replace(/<li value/g, '<li class="mb-2" value') // Add space between list items
        .replace(/(\n<li.*value.*>[\s\S]*?<\/li>)/g, '<ol class="my-4">$1</ol>') // Add space around the whole list
        .replace(/<\/ol>\s?<ol>/g, '')
        
        // Process tables
        .replace(/\|(.+)\|/g, (match, content) => {
            const cells = content.split('|').map(cell => `<td class="border border-slate-600 px-4 py-2">${cell.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/\|.*-.*\|/g, '') // remove markdown table header separator
        .replace(/(<tr>.*<\/tr>)/g, '<tbody>$1</tbody>')
        .replace(/<\/tbody>\s?<tbody>/g, '')
        .replace(/(<tbody>.*<\/tbody>)/g, '<table class="w-full table-auto border-collapse border border-slate-700 my-6">$1</table>')
        
        // Process paragraphs with spacing
        .replace(/\n/g, '<br />')
        .replace(/(<br \/>\s*){2,}/g, '<div class="h-4"></div>');
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ minutes, isLoading, error, loadingMessage }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(minutes);
    setCopied(true);
  };
  
  const formattedMinutes = formatMarkdown(minutes);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader />
          <p className="mt-4 text-slate-400 font-semibold">{loadingMessage || 'Processing...'}</p>
          <p className="text-sm text-slate-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <p className="font-bold">An Error Occurred</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      );
    }

    if (minutes) {
      return (
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: formattedMinutes }}/>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-center text-slate-500">
        <p>Your generated meeting minutes will appear here.</p>
      </div>
    );
  };

  return (
    <div className="relative h-full min-h-[300px] md:min-h-full bg-slate-900/70 rounded-xl p-4 md:p-6 border border-slate-700">
      {minutes && !isLoading && !error && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Copy to Clipboard"
        >
          <ClipboardIcon className="w-5 h-5" />
          {copied && <span className="absolute -left-2 top-10 w-24 text-center text-xs bg-slate-600 text-white py-1 rounded-md">Copied!</span>}
        </button>
      )}
      <div className="h-full overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};
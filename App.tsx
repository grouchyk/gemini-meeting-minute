import React, { useState, useCallback, useEffect } from 'react';
import { InputType } from './types';
import { Header } from './components/Header';
import { InputSelector } from './components/InputSelector';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { generateMinutes, transcribeAudio } from './services/geminiService';

const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('default', { month: 'short' });
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year} ${month} ${day}, ${hours}:${minutes}`;
};

const fileToGenerativePart = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(';')[0].split(':')[1];
      const data = result.split(',')[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};


export default function App() {
  const [inputType, setInputType] = useState<InputType>(InputType.Audio);
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [meetingMinutes, setMeetingMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [includeMeetingTime, setIncludeMeetingTime] = useState<boolean>(false);
  const [meetingTime, setMeetingTime] = useState<string>('');

  useEffect(() => {
    if (includeMeetingTime) {
      setMeetingTime(getFormattedDateTime());
    } else {
      setMeetingTime('');
    }
  }, [includeMeetingTime]);


  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setMeetingMinutes('');
    setError('');
    setTranscript('');

    if (!selectedFile) {
      return;
    }

    if (inputType === InputType.Text) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTranscript(text);
      };
      reader.onerror = () => {
        setError('Failed to read the text file.');
      };
      reader.readAsText(selectedFile);
    }
  }, [inputType]);

  const handleGenerate = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMeetingMinutes('');

    try {
      let currentTranscript = transcript;

      if (inputType === InputType.Audio && file) {
        setLoadingMessage('Transcribing audio...');
        const audioPart = await fileToGenerativePart(file);
        currentTranscript = await transcribeAudio(audioPart.data, audioPart.mimeType);
      }

      if (!currentTranscript) {
          throw new Error('Could not get a transcript from the provided file.');
      }
      
      setLoadingMessage('Generating minutes...');
      const result = await generateMinutes(currentTranscript, meetingTitle, includeMeetingTime ? meetingTime : undefined);
      setMeetingMinutes(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate minutes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const isGenerateDisabled = !file || isLoading;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Header />

        <main className="mt-8 bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700">
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
              {/* Left Side: Input Configuration */}
              <div className="flex flex-col space-y-6 md:col-span-2">
                <div>
                  <label className="text-lg font-semibold text-slate-300">1. Choose Input Type</label>
                  <InputSelector selectedType={inputType} onTypeChange={setInputType} />
                </div>
                 <div>
                    <h2 className="text-lg font-semibold text-slate-300">2. Add Details (Optional)</h2>
                    <div className="mt-2 space-y-4">
                        <div>
                            <label htmlFor="meetingTitle" className="text-sm font-medium text-slate-400">Meeting Title</label>
                            <input
                                type="text"
                                id="meetingTitle"
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                placeholder="e.g., Q3 Project Sync"
                                className="w-full mt-1 bg-slate-900/70 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                        </div>
                        <div className="relative">
                           <div className="flex items-center space-x-3">
                              <input
                                  type="checkbox"
                                  id="includeTime"
                                  checked={includeMeetingTime}
                                  onChange={(e) => setIncludeMeetingTime(e.target.checked)}
                                  className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                              />
                              <label htmlFor="includeTime" className="text-sm font-medium text-slate-400">Set Meeting Time</label>
                          </div>
                           {includeMeetingTime && (
                              <div className="mt-2">
                                  <input
                                      type="text"
                                      id="meetingTime"
                                      value={meetingTime}
                                      onChange={(e) => setMeetingTime(e.target.value)}
                                      className="w-full bg-slate-900/70 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                  />
                              </div>
                          )}
                        </div>
                    </div>
                </div>
                <div>
                  <label className="text-lg font-semibold text-slate-300">3. Upload your file</label>
                  <FileUpload inputType={inputType} onFileSelect={handleFileSelect} file={file} />
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className={`w-full py-3 px-6 text-lg font-bold rounded-xl transition-all duration-300 flex items-center justify-center
                      ${isGenerateDisabled 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-1'}`
                  }
                  >
                   Generate Minutes
                 </button>
              </div>

              {/* Right Side: Output Display */}
              <div className="flex flex-col md:col-span-3">
                 <label className="text-lg font-semibold text-slate-300 mb-2">4. Review Generated Minutes</label>
                <ResultDisplay
                  minutes={meetingMinutes}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  error={error}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
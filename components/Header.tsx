import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
        Meeting Minutes Generator
      </h1>
      <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
        Upload your meeting transcript or audio file, and let AI craft perfect, structured minutes for you.
      </p>
    </header>
  );
};

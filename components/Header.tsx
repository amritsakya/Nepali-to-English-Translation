
import React from 'react';
import { LanguageIcon } from './icons/LanguageIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center gap-3 mb-2">
            <LanguageIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                Nepali Translator
            </h1>
        </div>
      <p className="text-slate-400 max-w-2xl mx-auto">
        Instantly translate Nepali text to English with the power of generative AI.
      </p>
    </header>
  );
};

export default Header;

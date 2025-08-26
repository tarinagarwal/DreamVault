import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Languages, Check } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  TranslationLanguage,
} from "../services/translationService";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  disabled?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (language: TranslationLanguage) => {
    onLanguageChange(language.code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all duration-200 min-w-0
          ${
            disabled
              ? "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed"
              : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750 hover:border-neutral-600"
          }
          ${isOpen ? "ring-2 ring-brand-500 border-brand-500" : ""}
        `}
      >
        <Languages className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium flex-shrink-0">
          {selectedLang.flag}
        </span>
        <span className="text-sm truncate hidden sm:inline">
          {selectedLang.nativeName}
        </span>
        <span className="text-sm truncate sm:hidden">
          {selectedLang.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            <div className="text-xs font-medium text-neutral-400 px-3 py-2 border-b border-neutral-700 mb-2">
              Select Language
            </div>

            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200
                  ${
                    language.code === selectedLanguage
                      ? "bg-brand-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="text-sm font-medium">
                      {language.nativeName}
                    </div>
                    <div className="text-xs opacity-75">{language.name}</div>
                  </div>
                </div>

                {language.code === selectedLanguage && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #059669;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #047857;
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #059669 #374151;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;

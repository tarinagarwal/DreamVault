import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Type, Check } from "lucide-react";

interface FontSizeOption {
  label: string;
  value: string;
  description: string;
}

interface FontSizeSelectorProps {
  selectedFontSize: string;
  onFontSizeChange: (fontSize: string) => void;
  disabled?: boolean;
  className?: string;
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: "Small", value: "text-sm", description: "14px" },
  { label: "Medium", value: "text-base", description: "16px" },
  { label: "Large", value: "text-lg", description: "18px" },
  { label: "Extra Large", value: "text-xl", description: "20px" },
];

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  selectedFontSize,
  onFontSizeChange,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    FONT_SIZE_OPTIONS.find((option) => option.value === selectedFontSize) ||
    FONT_SIZE_OPTIONS[2]; // Default to Large

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

  const handleFontSizeSelect = (option: FontSizeOption) => {
    onFontSizeChange(option.value);
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
        <Type className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate hidden sm:inline">
          {selectedOption.label}
        </span>
        <span className="text-sm font-medium truncate sm:hidden">
          {selectedOption.label.charAt(0)}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            <div className="text-xs font-medium text-neutral-400 px-3 py-2 border-b border-neutral-700 mb-2">
              Select Font Size
            </div>

            {FONT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontSizeSelect(option)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200
                  ${
                    option.value === selectedFontSize
                      ? "bg-brand-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Type className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">
                      {option.description}
                    </div>
                  </div>
                </div>

                {option.value === selectedFontSize && (
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

export default FontSizeSelector;

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  className = "",
  placeholder = "Select option",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"left" | "right">(
    "left"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption =
    options.find((option) => option.value === selectedValue) || null;

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 224; // w-56 = 224px
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;

      // If there's not enough space on the right, position to the left
      if (spaceOnRight < dropdownWidth && spaceOnLeft > dropdownWidth) {
        setDropdownPosition("right");
      } else {
        setDropdownPosition("left");
      }
    }
  }, [isOpen]);

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

  const handleOptionSelect = (option: DropdownOption) => {
    onValueChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
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
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="text-sm font-medium truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto custom-scrollbar ${
            dropdownPosition === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="p-2">
            <div className="text-xs font-medium text-neutral-400 px-3 py-2 border-b border-neutral-700 mb-2">
              {placeholder}
            </div>

            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200
                  ${
                    option.value === selectedValue
                      ? "bg-brand-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-700"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {icon && <span className="flex-shrink-0">{icon}</span>}
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs opacity-75">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>

                {option.value === selectedValue && (
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

export default CustomDropdown;

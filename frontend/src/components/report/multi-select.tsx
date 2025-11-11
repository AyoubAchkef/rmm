'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Sélectionner...', label }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        {label}
      </label>

      {/* Selected Items Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-left"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        }}
      >
        <span className="flex-1 truncate">
          {selected.length === 0 ? (
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{placeholder}</span>
          ) : (
            selected.join(', ')
          )}
        </span>
        <ChevronDown
          className="w-4 h-4 ml-2 flex-shrink-0 transition-transform"
          style={{
            color: '#CC9F53',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{
            background: '#1C355E',
            border: '1px solid rgba(204, 159, 83, 0.3)',
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          {options.map(option => {
            const isSelected = selected.includes(option);
            return (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className="px-3 py-2 cursor-pointer flex items-center justify-between transition-colors"
                style={{
                  background: isSelected ? 'rgba(204, 159, 83, 0.15)' : 'transparent',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: isSelected ? '#CC9F53' : '#FFFFFF' }}>
                  {option}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4" style={{ color: '#CC9F53' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

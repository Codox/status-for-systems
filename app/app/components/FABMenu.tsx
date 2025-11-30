'use client';

import { useState } from 'react';

export interface FABMenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface FABMenuProps {
  items: FABMenuItem[];
}

export default function FABMenu({ items }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-8 right-8 z-50">
        {/* FAB Menu List */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                  index < items.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-700' : ''
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {item.loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  item.icon
                )}
                <div className="text-left flex-1">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.loading ? 'Processing...' : item.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    {item.loading ? 'Please wait' : item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-14 h-14 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          aria-label="Actions menu"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6h.01M12 12h.01M12 18h.01" />
          </svg>
          
          {/* Ripple Effect on Hover */}
          <span className="absolute inset-0 rounded-full bg-white dark:bg-zinc-900 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
        </button>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AccessibilityPanel = ({ isOpen, onClose }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // Load accessibility preferences from localStorage
  useEffect(() => {
    const savedContrast = localStorage.getItem('ktc-high-contrast') === 'true';
    const savedLargeText = localStorage.getItem('ktc-large-text') === 'true';
    
    setHighContrast(savedContrast);
    setLargeText(savedLargeText);
    
    // Apply saved preferences
    if (savedContrast) {
      document.body.classList.add('high-contrast');
    }
    if (savedLargeText) {
      document.body.classList.add('large-text');
    }
  }, []);

  const toggleContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    
    if (newContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    localStorage.setItem('ktc-high-contrast', newContrast.toString());
  };

  const toggleTextSize = () => {
    const newLargeText = !largeText;
    setLargeText(newLargeText);
    
    if (newLargeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    localStorage.setItem('ktc-large-text', newLargeText.toString());
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setLargeText(false);
    
    document.body.classList.remove('high-contrast');
    document.body.classList.remove('large-text');
    
    localStorage.removeItem('ktc-high-contrast');
    localStorage.removeItem('ktc-large-text');
  };

  return (
    <div className={`accessibility-panel ${isOpen ? 'open' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium">Accessibility Options:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleContrast}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                highContrast 
                  ? 'bg-white text-green-800' 
                  : 'border border-white hover:bg-white hover:text-green-800'
              }`}
              aria-pressed={highContrast}
              aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
            >
              Contrast
            </button>
            <button
              onClick={toggleTextSize}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                largeText 
                  ? 'bg-white text-green-800' 
                  : 'border border-white hover:bg-white hover:text-green-800'
              }`}
              aria-pressed={largeText}
              aria-label={`${largeText ? 'Disable' : 'Enable'} large text mode`}
            >
              Size
            </button>
            <button
              onClick={resetAccessibility}
              className="px-3 py-1 rounded text-sm font-medium border border-white hover:bg-white hover:text-green-800 transition-all"
              aria-label="Reset all accessibility options"
            >
              Reset
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Close accessibility panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityPanel;



import { useState, useEffect } from 'react';

export interface FontSettings {
  fontFamily: string;
  fontSize: number;
}

const DEFAULT_FONT_SETTINGS: FontSettings = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: 12
};

export const useFontSettings = () => {
  const [fontSettings, setFontSettings] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [isApplyingToSelection, setIsApplyingToSelection] = useState(true);
  
  // Load font settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notebook-font-settings');
    if (savedSettings) {
      try {
        setFontSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved font settings', error);
      }
    }
  }, []);
  
  // Save font settings to localStorage whenever they change
  const updateFontSettings = (newSettings: FontSettings) => {
    console.log('Updating font settings:', newSettings);
    setFontSettings(newSettings);
    localStorage.setItem('notebook-font-settings', JSON.stringify(newSettings));
  };
  
  // Toggle and save the application mode (selection vs entire document)
  const toggleApplyToSelection = (value: boolean) => {
    console.log('Setting isApplyingToSelection to:', value);
    setIsApplyingToSelection(value);
  };
  
  return { fontSettings, updateFontSettings, isApplyingToSelection, toggleApplyToSelection };
};

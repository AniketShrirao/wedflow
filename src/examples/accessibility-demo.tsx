/**
 * Accessibility Foundation Demo
 * Demonstrates the implemented accessibility features
 */

'use client';

import React from 'react';
import { AccessibilityProvider, useScreenReader, useKeyboardNavigation } from '@/components/accessibility/accessibility-provider';
import { useAriaLive } from '@/hooks/accessibility/use-aria-live';
import { useKeyboardNavigation as useKeyNav } from '@/hooks/accessibility/use-keyboard-navigation';
import { useFocusTrap } from '@/hooks/accessibility/use-focus-management';
import { getContrastRatio, analyzeColorContrast } from '@/lib/accessibility/color-contrast';

// Demo component showing ARIA live regions
function AriaLiveDemo() {
  const { announce } = useScreenReader();
  const { announce: hookAnnounce } = useAriaLive();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">ARIA Live Region Demo</h3>
      <div className="space-x-2">
        <button
          onClick={() => announce('This is a polite announcement')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Announce (Polite)
        </button>
        <button
          onClick={() => announce('This is an assertive announcement!', 'assertive')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Announce (Assertive)
        </button>
      </div>
    </div>
  );
}

// Demo component showing keyboard navigation
function KeyboardNavigationDemo() {
  const items = [
    { id: '1', onSelect: () => console.log('Item 1 selected') },
    { id: '2', onSelect: () => console.log('Item 2 selected') },
    { id: '3', onSelect: () => console.log('Item 3 selected') },
  ];

  const { focusedIndex, handleKeyDown, registerItem } = useKeyNav(items);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Keyboard Navigation Demo</h3>
      <p className="text-sm text-gray-600 mb-4">
        Use arrow keys to navigate, Enter/Space to select
      </p>
      <div className="space-y-2" onKeyDown={handleKeyDown}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => registerItem(index, el)}
            className={`block w-full p-2 text-left border rounded ${
              focusedIndex === index 
                ? 'bg-blue-100 border-blue-500' 
                : 'bg-gray-50 border-gray-300'
            }`}
            onClick={item.onSelect}
          >
            Navigation Item {item.id}
          </button>
        ))}
      </div>
    </div>
  );
}

// Demo component showing color contrast validation
function ColorContrastDemo() {
  const [foreground, setForeground] = React.useState('#000000');
  const [background, setBackground] = React.useState('#ffffff');

  const contrastResult = React.useMemo(() => {
    return analyzeColorContrast(foreground, background);
  }, [foreground, background]);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Color Contrast Validator</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Foreground Color
          </label>
          <input
            type="color"
            value={foreground}
            onChange={(e) => setForeground(e.target.value)}
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-full h-10 border rounded"
          />
        </div>
      </div>
      
      <div 
        className="p-4 rounded mb-4"
        style={{ 
          color: foreground, 
          backgroundColor: background 
        }}
      >
        Sample text with selected colors
      </div>

      <div className="space-y-2">
        <p>Contrast Ratio: <strong>{contrastResult.ratio}:1</strong></p>
        <p>WCAG AA: <span className={contrastResult.passes.AA ? 'text-green-600' : 'text-red-600'}>
          {contrastResult.passes.AA ? 'Pass' : 'Fail'}
        </span></p>
        <p>WCAG AAA: <span className={contrastResult.passes.AAA ? 'text-green-600' : 'text-red-600'}>
          {contrastResult.passes.AAA ? 'Pass' : 'Fail'}
        </span></p>
      </div>
    </div>
  );
}

// Main demo component
export default function AccessibilityDemo() {
  return (
    <AccessibilityProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Accessibility Foundation Demo</h1>
        
        <AriaLiveDemo />
        <KeyboardNavigationDemo />
        <ColorContrastDemo />
        
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="text-lg font-semibold mb-2 text-green-800">
            ✅ Foundation Layer Complete
          </h3>
          <p className="text-green-700">
            The accessibility foundation layer has been successfully implemented with:
          </p>
          <ul className="list-disc list-inside mt-2 text-green-700 space-y-1">
            <li>Comprehensive design token system</li>
            <li>ARIA live regions for screen reader announcements</li>
            <li>Keyboard navigation utilities</li>
            <li>Focus management system</li>
            <li>Color contrast validation</li>
            <li>Accessibility provider context</li>
          </ul>
        </div>
      </div>
    </AccessibilityProvider>
  );
}
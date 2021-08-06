import React, { useState, useLayoutEffect, useCallback } from 'react';
import './ColorPicker.scss';


export default function ColorPicker({hidden}) {
  const [hue, setHue] = useState(0);

  const getCssVar = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

  const changeHue = useCallback((newHue) => {
    setHue(newHue);
    localStorage.themeHue = newHue;
    // CSS variable
    document.documentElement.style.setProperty('--hue', newHue);
    // Theme color meta tag
    const themeColor = getCssVar('--tile-dark');
    let themeColorTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorTag) {
      themeColorTag.content = themeColor;
    } else {
      themeColorTag = document.createElement('meta');
      themeColorTag.name = 'theme-color';
      themeColorTag.content = themeColor;
      document.head.appendChild(themeColorTag);
    }
  }, []);

  // Initialize hue from local storage if available or from stylesheet default
  useLayoutEffect(() => {
    if (localStorage.themeHue) {
      const newHue = localStorage.themeHue * 1;
      changeHue(newHue);
    } else {
      const newHue = getCssVar('--hue') * 1;
      changeHue(newHue);
    }
  }, [changeHue]);

  return (
    <>
      {!hidden && (
        <div className="ColorPicker">
          <input type="range" min="0" max="360" step="1" value={hue} onChange={(e) => changeHue(e.target.value)} />
        </div>
      )}
    </>
  );
}
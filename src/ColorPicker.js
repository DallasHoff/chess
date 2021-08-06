import React, { useState, useLayoutEffect } from 'react';
import './ColorPicker.scss';


export default function ColorPicker({hidden}) {
  const [hue, setHue] = useState(0);

  const changeHue = (newHue) => {
    setHue(newHue);
    document.documentElement.style.setProperty('--hue', newHue);
    localStorage.themeHue = newHue;
  };

  // Initialize hue from local storage if available or from stylesheet default
  useLayoutEffect(() => {
    if (localStorage.themeHue) {
      const newHue = localStorage.themeHue * 1;
      changeHue(newHue);
    } else {
      setHue(getComputedStyle(document.documentElement).getPropertyValue('--hue') * 1);
    }
  }, []);

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
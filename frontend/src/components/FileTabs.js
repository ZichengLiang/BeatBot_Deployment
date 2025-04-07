// Tabs.jsx
import React, { useState } from 'react';
import './FileTabs.css';

function FileTabs({ tabs = [], setTabs, onTabClose  }) {

  const handleClose = (tabId) => {
    setTabs(tabs.filter(tab => tab.id !== tabId));
    onTabClose(tabId);
  };

  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <div key={tab.id} className="tab">
          <button className="tab-button">
            {tab.name}
          </button>
          <button 
            className="close-tab-button" 
            onClick={() => handleClose(tab.id)}
          >
            &#10005; {/* Close "X" icon */}
          </button>
        </div>
      ))}
    </div>
  );
}

export default FileTabs;

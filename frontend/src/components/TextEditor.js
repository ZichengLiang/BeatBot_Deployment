import React from 'react';
import './TextEditor.css';

const TextEditor = ({ text, setText }) => {
  return (
    <div className="text-editor-container">
      <label htmlFor="editor" className="editor-label">ABC Notation</label>
      <textarea
        id="editor"
        className="text-editor"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ABC Notation displayed here..."
      />
    </div>
  );
};

export default TextEditor;
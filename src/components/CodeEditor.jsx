import React, { useState } from "react";
import { Controlled as ControlledEditor } from "@uiw/react-codemirror";
import "codemnirror/lib/codemirror.css";
import "codemirror/theme/material.css";

const CodeEditor = () => {
  const [code, setCode] = useState("// Write your code here...");

  const handleCodeChange = (value) => {
    setCode(value);
  };

  return (
    <div className="bg-white p-4 rounded shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Code Editor</h2>
      <ControlledEditor
        value={code}
        options={{
          mode: "javascript",
          theme: "material",
          lineNumbers: true,
        }}
        onChange={(editor, data, value) => handleCodeChange(value)}
      />
    </div>
  );
};

export default CodeEditor;

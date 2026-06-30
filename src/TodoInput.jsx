import { useState } from "react";

export default function TodoInput({ addTodo }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");

  const submit = () => {
    if (!text.trim()) return;
    addTodo(text.trim(), priority);
    setText("");
    setPriority("medium");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="input-section">
      <div className="input-container">
        <input
          className="task-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />
        <button className="add-btn" onClick={submit} disabled={!text.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Priority Selector */}
      <div className="priority-row">
        <span className="priority-label-text">Priority:</span>
        {[
          { value: "high", label: "🔴 High" },
          { value: "medium", label: "🟡 Medium" },
          { value: "low", label: "🟢 Low" },
        ].map((p) => (
          <button
            key={p.value}
            className={`priority-btn ${priority === p.value ? "priority-active" : ""}`}
            onClick={() => setPriority(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

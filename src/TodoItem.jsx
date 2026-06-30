import { useState } from "react";

export default function TodoItem({ todo, toggleTodo, deleteTodo, editTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEditSubmit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      editTodo(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleEditSubmit();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const priorityColors = {
    high: "#ff4d6d",
    medium: "#ffd166",
    low: "#06d6a0",
  };

  const priorityLabel = todo.priority || "medium";
  const dot = priorityColors[priorityLabel];

  return (
    <li className={`todo-item ${todo.completed ? "todo-completed" : ""}`}>
      {/* Priority dot */}
      <span
        className="priority-dot"
        style={{ background: dot }}
        title={`Priority: ${priorityLabel}`}
      />

      {/* Checkbox */}
      <button
        className={`check-btn ${todo.completed ? "checked" : ""}`}
        onClick={() => toggleTodo(todo.id)}
        aria-label="Toggle complete"
      >
        {todo.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Text / Edit input */}
      {isEditing ? (
        <input
          className="edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span
          className={`todo-text ${todo.completed ? "completed" : ""}`}
          onDoubleClick={() => !todo.completed && setIsEditing(true)}
          title="Double-click to edit"
        >
          {todo.text}
        </span>
      )}

      {/* Action buttons */}
      <div className="item-actions">
        {!todo.completed && (
          <button
            className="action-btn edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit task"
          >
            ✏️
          </button>
        )}
        <button
          className="action-btn delete-btn"
          onClick={() => deleteTodo(todo.id)}
          title="Delete task"
        >
          🗑
        </button>
      </div>
    </li>
  );
}

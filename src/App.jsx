import { useState, useEffect } from "react";
import { db } from "./db";
import TodoInput from "./TodoInput";
import TodoItem from "./TodoItem";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [searchQuery, setSearchQuery] = useState("");

  // Load all todos from IndexedDB on mount, falling back to localStorage if blocked
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const all = await db.todos.orderBy("createdAt").reverse().toArray();
        setTodos(all);
      } catch (err) {
        console.warn("IndexedDB load failed, falling back to localStorage", err);
        const saved = localStorage.getItem("todo_backup");
        if (saved) {
          try {
            setTodos(JSON.parse(saved));
          } catch (e) {
            setTodos([]);
          }
        }
      }
    };
    loadTodos();
  }, []);

  // Helper to backup current todos state to localstorage as fallback
  const saveBackup = (currentTodos) => {
    try {
      localStorage.setItem("todo_backup", JSON.stringify(currentTodos));
    } catch (e) {
      console.error("Failed to write fallback backup", e);
    }
  };

  // Add a new todo to IndexedDB (and fallback)
  const addTodo = async (text, priority = "medium") => {
    const newTodoItem = {
      text,
      completed: false,
      createdAt: Date.now(),
      priority,
    };

    try {
      const id = await db.todos.add(newTodoItem);
      const newTodo = await db.todos.get(id);
      setTodos((prev) => {
        const next = [newTodo, ...prev];
        saveBackup(next);
        return next;
      });
    } catch (err) {
      console.warn("IndexedDB add failed, using memory state", err);
      // Fallback: create mock ID
      const newTodo = { ...newTodoItem, id: Date.now() };
      setTodos((prev) => {
        const next = [newTodo, ...prev];
        saveBackup(next);
        return next;
      });
    }
  };

  // Toggle completed status in IndexedDB (and fallback)
  const toggleTodo = async (id) => {
    try {
      const todo = await db.todos.get(id);
      if (todo) {
        await db.todos.update(id, { completed: !todo.completed });
      }
    } catch (err) {
      console.warn("IndexedDB update failed, using memory state", err);
    }
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveBackup(next);
      return next;
    });
  };

  // Delete from IndexedDB (and fallback)
  const deleteTodo = async (id) => {
    try {
      await db.todos.delete(id);
    } catch (err) {
      console.warn("IndexedDB delete failed, using memory state", err);
    }
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveBackup(next);
      return next;
    });
  };

  // Edit text in IndexedDB (and fallback)
  const editTodo = async (id, newText) => {
    try {
      await db.todos.update(id, { text: newText });
    } catch (err) {
      console.warn("IndexedDB edit failed, using memory state", err);
    }
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, text: newText } : t));
      saveBackup(next);
      return next;
    });
  };

  // Clear all completed (and fallback)
  const clearCompleted = async () => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    try {
      await db.todos.bulkDelete(completedIds);
    } catch (err) {
      console.warn("IndexedDB bulk delete failed, using memory state", err);
    }
    setTodos((prev) => {
      const next = prev.filter((t) => !t.completed);
      saveBackup(next);
      return next;
    });
  };

  // Filtered & searched list
  const filteredTodos = todos
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) =>
      t.text && t.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="app-wrapper">
      <div className="app">
        {/* Header */}
        <div className="app-header">
          <h1>
            <span className="header-icon">✓</span> TaskFlow
          </h1>
          <p className="app-subtitle">Offline-First Task Manager</p>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-num">{todos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill active-stat">
            <span className="stat-num">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-pill done-stat">
            <span className="stat-num">{completedCount}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        {/* Input */}
        <TodoInput addTodo={addTodo} />

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              <span className="empty-icon">🎉</span>
              <p>
                {searchQuery
                  ? "No tasks match your search."
                  : filter === "completed"
                  ? "No completed tasks yet."
                  : "All clear! Add a task above."}
              </p>
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
                editTodo={editTodo}
              />
            ))
          )}
        </ul>

        {/* Footer Actions */}
        {completedCount > 0 && (
          <div className="footer-actions">
            <button className="clear-btn" onClick={clearCompleted}>
              🗑 Clear {completedCount} completed
            </button>
          </div>
        )}

        <p className="offline-badge">⚡ Data saved locally via IndexedDB</p>
      </div>
    </div>
  );
}

export default App;

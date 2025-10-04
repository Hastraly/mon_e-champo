import { useState, useEffect } from 'react';
import { supabase, Todo, TodoFormatting } from '../lib/supabase';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, AlertCircle, Bold, Italic, Underline, Highlighter, CreditCard as Edit2, Check } from 'lucide-react';

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-100 text-amber-600 border-amber-200',
  high: 'bg-red-100 text-red-600 border-red-200',
};

const PRIORITY_LABELS = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute',
};

const HIGHLIGHT_COLORS = [
  { name: 'Jaune', value: '#FEF08A' },
  { name: 'Vert', value: '#BBF7D0' },
  { name: 'Bleu', value: '#BFDBFE' },
  { name: 'Rose', value: '#FBCFE8' },
  { name: 'Orange', value: '#FED7AA' },
];

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFormatting, setEditFormatting] = useState<TodoFormatting>({});

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (data) setTodos(data);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('todos').insert({
      user_id: user.id,
      title: title.trim(),
      priority,
      due_date: dueDate || null,
      completed: false,
      formatting: {},
    });

    setTitle('');
    setPriority('medium');
    setDueDate('');
    setShowAddModal(false);
    loadTodos();
  };

  const toggleComplete = async (todo: Todo) => {
    await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id);
    loadTodos();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
    loadTodos();
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditFormatting(todo.formatting || {});
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    await supabase
      .from('todos')
      .update({
        title: editTitle.trim(),
        formatting: editFormatting
      })
      .eq('id', editingId);

    setEditingId(null);
    setEditTitle('');
    setEditFormatting({});
    loadTodos();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditFormatting({});
  };

  const toggleFormatting = (key: 'bold' | 'italic' | 'underline') => {
    setEditFormatting(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setHighlight = (color: string | undefined) => {
    setEditFormatting(prev => ({ ...prev, highlight: color }));
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const isOverdue = (todo: Todo) => {
    if (!todo.due_date || todo.completed) return false;
    return new Date(todo.due_date) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderTodoTitle = (todo: Todo, isEditing: boolean = false) => {
    const formatting = isEditing ? editFormatting : (todo.formatting || {});
    const text = isEditing ? editTitle : todo.title;

    const style: React.CSSProperties = {
      fontWeight: formatting.bold ? 'bold' : 'normal',
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: formatting.underline ? 'underline' : 'none',
      backgroundColor: formatting.highlight || 'transparent',
      padding: formatting.highlight ? '2px 4px' : '0',
      borderRadius: formatting.highlight ? '4px' : '0',
    };

    if (isEditing) {
      return (
        <input
          type="text"
          value={text}
          onChange={(e) => setEditTitle(e.target.value)}
          style={style}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          autoFocus
        />
      );
    }

    return <span style={style}>{text}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">To-Do List</h2>
          <p className="text-sm text-slate-500 mt-1">
            {activeTodos.length} tâche{activeTodos.length !== 1 ? 's' : ''} en cours
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-6">
        {activeTodos.length > 0 && (
          <div className="space-y-3">
            {activeTodos.map((todo) => {
              const daysUntil = todo.due_date ? getDaysUntilDue(todo.due_date) : null;
              const isEditing = editingId === todo.id;

              return (
                <div
                  key={todo.id}
                  className={`group p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    isOverdue(todo)
                      ? 'border-red-300 bg-red-50'
                      : daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(todo)}
                      className="mt-1 flex-shrink-0 text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      <Circle className="w-6 h-6" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      {isEditing ? (
                        <div className="space-y-3">
                          {renderTodoTitle(todo, true)}

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => toggleFormatting('bold')}
                              className={`p-2 rounded-lg transition-all ${
                                editFormatting.bold
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFormatting('italic')}
                              className={`p-2 rounded-lg transition-all ${
                                editFormatting.italic
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFormatting('underline')}
                              className={`p-2 rounded-lg transition-all ${
                                editFormatting.underline
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Underline className="w-4 h-4" />
                            </button>

                            <div className="h-6 w-px bg-slate-300 mx-1" />

                            {HIGHLIGHT_COLORS.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setHighlight(editFormatting.highlight === color.value ? undefined : color.value)}
                                className={`w-8 h-8 rounded-lg transition-all border-2 ${
                                  editFormatting.highlight === color.value
                                    ? 'border-teal-500 scale-110'
                                    : 'border-slate-200 hover:scale-105'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Enregistrer
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-slate-800 font-medium">
                            {renderTodoTitle(todo)}
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                                PRIORITY_COLORS[todo.priority]
                              }`}
                            >
                              {PRIORITY_LABELS[todo.priority]}
                            </span>

                            {todo.due_date && (
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium ${
                                  isOverdue(todo)
                                    ? 'bg-red-100 text-red-700'
                                    : daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {isOverdue(todo) ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : (
                                  <Calendar className="w-4 h-4" />
                                )}
                                <span className="text-sm">
                                  {new Date(todo.due_date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                                {daysUntil !== null && !isOverdue(todo) && (
                                  <span className="text-xs">
                                    ({daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : `${daysUntil}j`})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(todo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Terminées ({completedTodos.length})
            </h3>
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-start gap-3 p-4 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-75 hover:opacity-100 transition-all"
              >
                <button
                  onClick={() => toggleComplete(todo)}
                  className="mt-0.5 flex-shrink-0 text-teal-600 hover:text-slate-400 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 line-through">{renderTodoTitle(todo)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                        PRIORITY_COLORS[todo.priority]
                      }`}
                    >
                      {PRIORITY_LABELS[todo.priority]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {todos.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            Aucune tâche. Ajoutez-en une pour commencer !
          </p>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Nouvelle tâche</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTitle('');
                  setPriority('medium');
                  setDueDate('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Que devez-vous faire ?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priorité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-4 rounded-xl border-2 font-medium transition-all ${
                        priority === p
                          ? PRIORITY_COLORS[p] + ' border-current'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date d'échéance (optionnel)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!title.trim()}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Créer la tâche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

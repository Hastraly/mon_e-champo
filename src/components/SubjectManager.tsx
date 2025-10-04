import { useState } from 'react';
import { supabase, Subject } from '../lib/supabase';
import { Plus, Trash2, CreditCard as Edit2, Check, X } from 'lucide-react';
import ColorPalette from './ColorPalette';

interface SubjectManagerProps {
  subjects: Subject[];
  onRefresh: () => void;
}

export default function SubjectManager({ subjects, onRefresh }: SubjectManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF6B9D');

  const handleAdd = async () => {
    if (!name.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('subjects').insert({
      user_id: user.id,
      name: name.trim(),
      color,
    });

    setName('');
    setColor('#FF6B9D');
    setShowAddModal(false);
    onRefresh();
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;

    await supabase.from('subjects').update({ name: name.trim(), color }).eq('id', id);

    setEditingId(null);
    setName('');
    setColor('#FF6B9D');
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette matière ? Les cours associés seront également supprimés.')) return;
    await supabase.from('subjects').delete().eq('id', id);
    onRefresh();
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setColor(subject.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setColor('#FF6B9D');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Mes matières</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      <div className="space-y-3">
        {subjects.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Aucune matière. Commencez par en créer une !
          </p>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-all group"
            >
              {editingId === subject.id ? (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom de la matière"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(subject.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="flex-1 font-medium text-slate-700">{subject.name}</span>
                  <button
                    onClick={() => startEdit(subject)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Nouvelle matière</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setName('');
                  setColor('#FF6B9D');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la matière
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ex: Mathématiques"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Couleur
                </label>
                <ColorPalette selectedColor={color} onColorSelect={setColor} />
              </div>

              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Créer la matière
              </button>
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Modifier la matière</h3>
              <button
                onClick={cancelEdit}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la matière
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ex: Mathématiques"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Couleur
                </label>
                <ColorPalette selectedColor={color} onColorSelect={setColor} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelEdit}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpdate(editingId)}
                  disabled={!name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

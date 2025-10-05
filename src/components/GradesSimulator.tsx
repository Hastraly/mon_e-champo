import { useState, useEffect } from 'react';
import { supabase, Subject, Grade } from '../lib/supabase';
import { Plus, Trash2, Calculator, TrendingUp, Award } from 'lucide-react';
import { DEFAULT_SUBJECTS } from '../lib/defaultSubjects';

export default function GradesSimulator() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [gradeMax, setGradeMax] = useState('20');
  const [gradeCoefficient, setGradeCoefficient] = useState('1');
  const [gradeDescription, setGradeDescription] = useState('');
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSubjects();
    loadGrades();
    initializeDefaultSubjects();
  }, []);

  const initializeDefaultSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existingSubjects } = await supabase
      .from('subjects')
      .select('id')
      .eq('user_id', user.id);

    if (existingSubjects && existingSubjects.length === 0) {
      const subjectsToInsert = DEFAULT_SUBJECTS.map(sub => ({
        user_id: user.id,
        name: sub.name,
        color: sub.color,
        subject_coefficient: sub.coefficient,
        is_default: true,
      }));

      await supabase.from('subjects').insert(subjectsToInsert);
      loadSubjects();
    }
  };

  const loadSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    if (data) setSubjects(data);
  };

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('*')
      .order('date', { ascending: false });
    if (data) setGrades(data);
  };

  const handleAddGrade = async () => {
    if (!selectedSubjectId || !gradeValue || !gradeMax) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('grades').insert({
      user_id: user.id,
      subject_id: selectedSubjectId,
      grade_value: parseFloat(gradeValue),
      grade_max: parseFloat(gradeMax),
      coefficient: parseFloat(gradeCoefficient),
      description: gradeDescription,
      date: gradeDate,
    });

    setGradeValue('');
    setGradeMax('20');
    setGradeCoefficient('1');
    setGradeDescription('');
    setGradeDate(new Date().toISOString().split('T')[0]);
    setShowAddGradeModal(false);
    loadGrades();
  };

  const handleDeleteGrade = async (id: string) => {
    await supabase.from('grades').delete().eq('id', id);
    loadGrades();
  };

  const calculateSubjectAverage = (subjectId: string): number | null => {
    const subjectGrades = grades.filter(g => g.subject_id === subjectId);
    if (subjectGrades.length === 0) return null;

    let totalWeighted = 0;
    let totalCoefficients = 0;

    subjectGrades.forEach(grade => {
      const normalized = (grade.grade_value / grade.grade_max) * 20;
      totalWeighted += normalized * grade.coefficient;
      totalCoefficients += grade.coefficient;
    });

    return totalCoefficients > 0 ? totalWeighted / totalCoefficients : null;
  };

  const calculateGeneralAverage = (): number | null => {
    const subjectsWithGrades = subjects.filter(s => {
      const avg = calculateSubjectAverage(s.id);
      return avg !== null;
    });

    if (subjectsWithGrades.length === 0) return null;

    let totalWeighted = 0;
    let totalCoefficients = 0;

    subjectsWithGrades.forEach(subject => {
      const avg = calculateSubjectAverage(subject.id);
      if (avg !== null) {
        const coeff = subject.subject_coefficient || 1;
        totalWeighted += avg * coeff;
        totalCoefficients += coeff;
      }
    });

    return totalCoefficients > 0 ? totalWeighted / totalCoefficients : null;
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const generalAverage = calculateGeneralAverage();

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
              Simulation de Notes
            </h2>
            <p className="text-purple-100 mt-1 text-sm sm:text-base">
              Calculez vos moyennes et suivez vos performances
            </p>
          </div>
          {generalAverage !== null && (
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-xs sm:text-sm font-medium text-purple-100">Moyenne Générale</div>
              <div className="text-3xl sm:text-4xl font-bold mt-1">
                {generalAverage.toFixed(2)}
                <span className="text-xl sm:text-2xl">/20</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {subjects.map(subject => {
          const subjectGrades = grades.filter(g => g.subject_id === subject.id);
          const average = calculateSubjectAverage(subject.id);

          return (
            <div key={subject.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div
                className="p-3 sm:p-4 text-white"
                style={{ backgroundColor: subject.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate">{subject.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      Coef: {subject.subject_coefficient || 1}
                    </p>
                  </div>
                  {average !== null && (
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-bold">
                        {average.toFixed(2)}
                        <span className="text-xs sm:text-sm">/20</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {subjectGrades.length === 0 ? (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    Aucune note pour cette matière
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subjectGrades.map(grade => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg" style={{ color: subject.color }}>
                              {grade.grade_value}/{grade.grade_max}
                            </span>
                            <span className="text-xs text-slate-500">
                              (coef. {grade.coefficient})
                            </span>
                          </div>
                          {grade.description && (
                            <p className="text-sm text-slate-600 mt-1">{grade.description}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(grade.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setShowAddGradeModal(true);
                  }}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une note
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddGradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Ajouter une note</h3>
              <button
                onClick={() => setShowAddGradeModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Matière
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Note obtenue
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Note sur
                  </label>
                  <select
                    value={gradeMax}
                    onChange={(e) => setGradeMax(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Coefficient
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={gradeCoefficient}
                  onChange={(e) => setGradeCoefficient(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={gradeDescription}
                  onChange={(e) => setGradeDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Contrôle chapitre 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={gradeDate}
                  onChange={(e) => setGradeDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={handleAddGrade}
                disabled={!selectedSubjectId || !gradeValue || !gradeMax}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Ajouter la note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

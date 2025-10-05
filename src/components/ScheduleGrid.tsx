import { useState, useEffect } from 'react';
import { supabase, Subject, ScheduleEntry } from '../lib/supabase';
import { Plus, X, Clock, Repeat, GripVertical } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

interface ScheduleGridProps {
  subjects: Subject[];
  onRefresh: () => void;
}

export default function ScheduleGrid({ subjects, onRefresh }: ScheduleGridProps) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<'both' | 'week1' | 'week2'>('both');
  const [currentWeekFilter, setCurrentWeekFilter] = useState<'all' | 'week1' | 'week2'>('all');
  const [draggedEntry, setDraggedEntry] = useState<ScheduleEntry | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [weekType, setWeekType] = useState<'both' | 'week1' | 'week2'>('both');
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly'>('none');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data } = await supabase
      .from('schedule_entries')
      .select('*')
      .order('start_time');
    if (data) setEntries(data);
  };

  const handleCellClick = (day: number, hour: number) => {
    if (subjects.length === 0) {
      alert('Veuillez d\'abord créer une matière');
      return;
    }
    setSelectedDay(day);
    setSelectedHour(hour);
    setStartTime(`${hour.toString().padStart(2, '0')}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setSelectedSubject(subjects[0].id);
    setWeekType('both');
    setRecurrence('none');
    setShowAddModal(true);
  };

  const handleAddEntry = async () => {
    if (!selectedSubject || !startTime || !endTime || selectedDay === null) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('schedule_entries').insert({
      user_id: user.id,
      subject_id: selectedSubject,
      day_of_week: selectedDay,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      week_type: weekType,
      recurrence: recurrence,
    });

    setShowAddModal(false);
    loadEntries();
    onRefresh();
  };

  const handleDeleteEntry = async (id: string) => {
    await supabase.from('schedule_entries').delete().eq('id', id);
    loadEntries();
    onRefresh();
  };

  const handleDragStart = (entry: ScheduleEntry) => {
    setDraggedEntry(entry);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (day: number, hour: number) => {
    if (!draggedEntry) return;

    const startHour = parseInt(draggedEntry.start_time.split(':')[0]);
    const endHour = parseInt(draggedEntry.end_time.split(':')[0]);
    const duration = endHour - startHour;

    const newStartTime = `${hour.toString().padStart(2, '0')}:${draggedEntry.start_time.split(':')[1]}`;
    const newEndTime = `${(hour + duration).toString().padStart(2, '0')}:${draggedEntry.end_time.split(':')[1]}`;

    await supabase
      .from('schedule_entries')
      .update({
        day_of_week: day,
        start_time: newStartTime,
        end_time: newEndTime,
      })
      .eq('id', draggedEntry.id);

    setDraggedEntry(null);
    loadEntries();
    onRefresh();
  };

  const getEntriesForCell = (day: number, hour: number) => {
    return entries.filter((entry) => {
      const startHour = parseInt(entry.start_time.split(':')[0]);
      const startMinute = parseInt(entry.start_time.split(':')[1]);
      const endHour = parseInt(entry.end_time.split(':')[0]);
      const endMinute = parseInt(entry.end_time.split(':')[1]);

      const cellStart = hour * 60;
      const cellEnd = (hour + 1) * 60;
      const entryStart = startHour * 60 + startMinute;
      const entryEnd = endHour * 60 + endMinute;

      const matchesDay = entry.day_of_week === day;
      const matchesTime = entryStart < cellEnd && entryEnd > cellStart;
      const matchesWeek = currentWeekFilter === 'all' ||
                         entry.week_type === 'both' ||
                         entry.week_type === currentWeekFilter;

      return matchesDay && matchesTime && matchesWeek;
    });
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const calculateDuration = (start: string, end: string): number => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
  };

  const getWeekBadge = (weekType: string) => {
    if (weekType === 'week1') return 'S1';
    if (weekType === 'week2') return 'S2';
    return '';
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCurrentWeekFilter('all')}
          className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all ${
            currentWeekFilter === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setCurrentWeekFilter('week1')}
          className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all ${
            currentWeekFilter === 'week1'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semaine 1
        </button>
        <button
          onClick={() => setCurrentWeekFilter('week2')}
          className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all ${
            currentWeekFilter === 'week2'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semaine 2
        </button>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-4 lg:p-6 overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[800px]">
          <div className="grid grid-cols-8 gap-2">
            <div className="font-medium text-slate-700"></div>
            {DAYS.map((day) => (
              <div key={day} className="text-center font-medium text-slate-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2 mt-2">
              <div className="text-sm text-slate-600 font-medium py-3 text-right pr-2">
                {hour}:00
              </div>
              {DAYS.map((_, dayIndex) => {
                const cellEntries = getEntriesForCell(dayIndex, hour);
                const firstEntry = cellEntries[0];
                const subject = firstEntry ? getSubjectById(firstEntry.subject_id) : null;
                const isStart = firstEntry && parseInt(firstEntry.start_time.split(':')[0]) === hour;

                if (firstEntry && isStart) {
                  const duration = calculateDuration(firstEntry.start_time, firstEntry.end_time);
                  return (
                    <div
                      key={dayIndex}
                      draggable
                      onDragStart={() => handleDragStart(firstEntry)}
                      className="relative group rounded-xl p-3 flex flex-col justify-between shadow-md hover:shadow-lg transition-all border-2 border-white cursor-move"
                      style={{
                        backgroundColor: subject?.color || '#E2E8F0',
                        gridRow: `span ${duration}`,
                        minHeight: `${duration * 4}rem`
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-white font-medium text-sm drop-shadow-sm flex-1">
                          {subject?.name}
                          {firstEntry.week_type !== 'both' && (
                            <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded">
                              {getWeekBadge(firstEntry.week_type)}
                            </span>
                          )}
                        </div>
                        <GripVertical className="w-4 h-4 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-white text-xs opacity-90 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {firstEntry.start_time.substring(0, 5)} - {firstEntry.end_time.substring(0, 5)}
                      </div>
                      {firstEntry.recurrence !== 'none' && (
                        <div className="text-white text-xs opacity-90 flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {firstEntry.recurrence === 'weekly' ? 'Hebdo' : 'Bihebdo'}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteEntry(firstEntry.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded-lg p-1"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  );
                } else if (firstEntry) {
                  return null;
                }

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleCellClick(dayIndex, hour)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dayIndex, hour)}
                    className="border-2 border-slate-200 rounded-xl h-16 hover:bg-slate-50 transition-all hover:border-blue-300 group flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full space-y-3 sm:space-y-4 my-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Ajouter un cours</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Matière
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Semaine(s)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'both', label: 'Toutes' },
                    { value: 'week1', label: 'Semaine 1' },
                    { value: 'week2', label: 'Semaine 2' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWeekType(option.value as any)}
                      className={`py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 font-medium transition-all ${
                        weekType === option.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                  Récurrence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'none', label: 'Aucune' },
                    { value: 'weekly', label: 'Hebdomadaire' },
                    { value: 'biweekly', label: 'Bihebdomadaire' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRecurrence(option.value as any)}
                      className={`py-2 px-3 rounded-xl border-2 font-medium transition-all text-sm ${
                        recurrence === option.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddEntry}
                disabled={!selectedSubject || !startTime || !endTime}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Ajouter le cours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type ScheduleEntry = {
  id: string;
  user_id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  week_type: 'both' | 'week1' | 'week2';
  recurrence: 'none' | 'weekly' | 'biweekly';
  created_at: string;
};

export type TodoFormatting = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: string;
};

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  formatting: TodoFormatting;
  created_at: string;
};

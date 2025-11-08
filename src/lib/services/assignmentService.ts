import { supabase } from '@/integrations/supabase/client';
import { Assignment } from '../templates/types';

export const assignmentService = {
  /**
   * Create a new assignment
   */
  async create(assignment: Omit<Assignment, '_id' | 'createdAt'>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        user_id: user.user.id,
        title: assignment.title,
        type: assignment.type,
        exam_subtype: assignment.examSubtype || 'hybrid',
        due_at: assignment.dueDate,
        topics: assignment.topics,
        status: assignment.status || 'upcoming'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all assignments for current user
   */
  async getAll() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.user.id)
      .order('due_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get upcoming assignments (due in next 30 days)
   */
  async getUpcoming() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', user.user.id)
      .gte('due_at', now.toISOString())
      .lte('due_at', futureDate.toISOString())
      .order('due_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get single assignment by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update assignment status
   */
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('assignments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete assignment
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};


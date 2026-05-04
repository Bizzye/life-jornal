import { supabase } from '@/lib/supabase';
import type { EntryInput } from '@/schemas/entry.schema';
import type { Registro } from '@/types';

const TABLE = 'registros';

export const entryService = {
  async count(userId: string) {
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  },

  async list(userId: string, filters?: { category_id?: string; offset?: number; limit?: number }) {
    const limit = filters?.limit ?? 5;
    const offset = filters?.offset ?? 0;

    let query = supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.category_id) query = query.eq('category_id', filters.category_id);

    const { data, error } = await query;
    if (error) throw error;
    return data as Registro[];
  },

  async listByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });
    if (error) throw error;
    return data as Registro[];
  },

  async create(userId: string, input: EntryInput) {
    const { event_time, event_date, subcategory_id, custom_field_values, ...rest } = input;
    const combinedDate = `${event_date}T${event_time || '00:00'}:00`;
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        ...rest,
        subcategory_id: subcategory_id || null,
        event_date: combinedDate,
        photo_urls: rest.photo_urls ?? [],
        custom_field_values: custom_field_values ?? {},
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Registro;
  },

  async update(id: string, input: Partial<EntryInput>) {
    const { event_time, event_date, subcategory_id, custom_field_values, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest };
    if (subcategory_id !== undefined) {
      payload.subcategory_id = subcategory_id || null;
    }
    if (custom_field_values !== undefined) {
      payload.custom_field_values = custom_field_values;
    }
    if (event_date && !String(event_date).includes('T')) {
      payload.event_date = `${event_date}T${event_time || '00:00'}:00`;
    } else if (event_date) {
      payload.event_date = event_date;
    }
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Registro;
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },
};

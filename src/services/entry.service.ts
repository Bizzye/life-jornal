import { supabase } from "@/lib/supabase";
import type { EntryInput } from "@/schemas/entry.schema";
import type { Registro } from "@/types";

const TABLE = "registros";

export const entryService = {
  async list(
    userId: string,
    filters?: { category?: string; offset?: number; limit?: number },
  ) {
    const limit = filters?.limit ?? 5;
    const offset = filters?.offset ?? 0;

    let query = supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.category) query = query.eq("category", filters.category);

    const { data, error } = await query;
    if (error) throw error;
    return data as Registro[];
  },

  async listByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .gte("event_date", startDate)
      .lte("event_date", endDate)
      .order("event_date", { ascending: true });
    if (error) throw error;
    return data as Registro[];
  },

  async create(userId: string, input: EntryInput) {
    const { event_time, event_date, ...rest } = input;
    const combinedDate = `${event_date}T${event_time || "00:00"}:00`;
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        ...rest,
        event_date: combinedDate,
        photo_urls: rest.photo_urls ?? [],
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Registro;
  },

  async update(id: string, input: Partial<EntryInput>) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Registro;
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
};

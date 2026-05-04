import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { CategoryInput, CustomFieldInput, SubcategoryInput } from '@/schemas/category.schema';
import type { CategoryCustomField, UserCategory, UserSubcategory } from '@/types';

const CATEGORIES_TABLE = 'user_categories';
const SUBCATEGORIES_TABLE = 'user_subcategories';
const CUSTOM_FIELDS_TABLE = 'category_custom_fields';

const CATEGORY_SELECT =
  '*, subcategories:user_subcategories(*), custom_fields:category_custom_fields(*)';

export const categoryService = {
  async list(userId: string): Promise<UserCategory[]> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select(CATEGORY_SELECT)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      custom_fields: (c.custom_fields as CategoryCustomField[] | null) ?? [],
    })) as UserCategory[];
  },

  async create(userId: string, input: CategoryInput): Promise<UserCategory> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert({ ...input, user_id: userId })
      .select(CATEGORY_SELECT)
      .single();
    if (error) throw error;
    return { ...data, custom_fields: data.custom_fields ?? [] } as UserCategory;
  },

  async update(id: string, input: Partial<CategoryInput>): Promise<UserCategory> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .update(input)
      .eq('id', id)
      .select(CATEGORY_SELECT)
      .single();
    if (error) throw error;
    return { ...data, custom_fields: data.custom_fields ?? [] } as UserCategory;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(CATEGORIES_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async createSubcategory(userId: string, input: SubcategoryInput): Promise<UserSubcategory> {
    const { data, error } = await supabase
      .from(SUBCATEGORIES_TABLE)
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as UserSubcategory;
  },

  async updateSubcategory(
    id: string,
    input: Partial<Pick<SubcategoryInput, 'name'>>,
  ): Promise<UserSubcategory> {
    const { data, error } = await supabase
      .from(SUBCATEGORIES_TABLE)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as UserSubcategory;
  },

  async removeSubcategory(id: string): Promise<void> {
    const { error } = await supabase.from(SUBCATEGORIES_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  // ── Custom Fields ──────────────────────────────────────────

  async createCustomField(userId: string, input: CustomFieldInput): Promise<CategoryCustomField> {
    const { data, error } = await supabase
      .from(CUSTOM_FIELDS_TABLE)
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as CategoryCustomField;
  },

  async updateCustomField(
    id: string,
    input: Partial<Pick<CustomFieldInput, 'name' | 'field_type' | 'options'>>,
  ): Promise<CategoryCustomField> {
    const { data, error } = await supabase
      .from(CUSTOM_FIELDS_TABLE)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CategoryCustomField;
  },

  async removeCustomField(id: string): Promise<void> {
    const { error } = await supabase.from(CUSTOM_FIELDS_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  /** Seed default categories for a new user. Idempotent via ON CONFLICT. */
  async seedDefaults(userId: string): Promise<void> {
    const rows = DEFAULT_CATEGORIES.map((cat, i) => ({
      user_id: userId,
      name: cat.name,
      color: cat.color,
      slug: cat.slug,
      is_default: true,
      sort_order: i,
    }));
    // upsert with onConflict ensures idempotency for concurrent calls
    const { error } = await supabase
      .from(CATEGORIES_TABLE)
      .upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true });
    if (error) throw error;
  },

  /** Backfill category_id on old registros that only have the text category column. */
  async backfillRegistros(userId: string): Promise<void> {
    // Fetch user's default categories to map slug → id
    const { data: cats, error: catError } = await supabase
      .from(CATEGORIES_TABLE)
      .select('id, slug')
      .eq('user_id', userId)
      .not('slug', 'is', null);
    if (catError) throw catError;
    if (!cats?.length) return;

    const slugMap = new Map(cats.map((c) => [c.slug, c.id]));

    // For each slug, update registros that have the matching category text
    for (const [slug, categoryId] of slugMap) {
      const { error } = await supabase
        .from('registros')
        .update({ category_id: categoryId })
        .eq('user_id', userId)
        .eq('category', slug)
        .is('category_id', null);
      if (error) throw error;
    }
  },
};

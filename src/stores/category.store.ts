import type { CategoryCustomField, UserCategory, UserSubcategory } from '@/types';
import { create } from 'zustand';

interface CategoryState {
  categories: UserCategory[];
  loading: boolean;
  seeded: boolean;
  setCategories: (categories: UserCategory[]) => void;
  addCategory: (category: UserCategory) => void;
  updateCategory: (id: string, data: Partial<UserCategory>) => void;
  removeCategory: (id: string) => void;
  addSubcategory: (categoryId: string, sub: UserSubcategory) => void;
  updateSubcategory: (categoryId: string, subId: string, data: Partial<UserSubcategory>) => void;
  removeSubcategory: (categoryId: string, subId: string) => void;
  addCustomField: (categoryId: string, field: CategoryCustomField) => void;
  updateCustomField: (
    categoryId: string,
    fieldId: string,
    data: Partial<CategoryCustomField>,
  ) => void;
  removeCustomField: (categoryId: string, fieldId: string) => void;
  setLoading: (loading: boolean) => void;
  setSeeded: (seeded: boolean) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  seeded: false,
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((s) => ({ categories: [...s.categories, category] })),
  updateCategory: (id, data) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  removeCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
  addSubcategory: (categoryId, sub) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId ? { ...c, subcategories: [...c.subcategories, sub] } : c,
      ),
    })),
  updateSubcategory: (categoryId, subId, data) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((sub) =>
                sub.id === subId ? { ...sub, ...data } : sub,
              ),
            }
          : c,
      ),
    })),
  removeSubcategory: (categoryId, subId) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.filter((sub) => sub.id !== subId),
            }
          : c,
      ),
    })),
  addCustomField: (categoryId, field) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId ? { ...c, custom_fields: [...c.custom_fields, field] } : c,
      ),
    })),
  updateCustomField: (categoryId, fieldId, data) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              custom_fields: c.custom_fields.map((f) => (f.id === fieldId ? { ...f, ...data } : f)),
            }
          : c,
      ),
    })),
  removeCustomField: (categoryId, fieldId) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              custom_fields: c.custom_fields.filter((f) => f.id !== fieldId),
            }
          : c,
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setSeeded: (seeded) => set({ seeded }),
}));

import type { CategoryInput, CustomFieldInput, SubcategoryInput } from '@/schemas/category.schema';
import { categoryService } from '@/services/category.service';
import { useAuthStore } from '@/stores/auth.store';
import { useCategoryStore } from '@/stores/category.store';
import { useCallback, useEffect } from 'react';

export function useCategories() {
  const {
    categories,
    loading,
    seeded,
    setCategories,
    addCategory,
    updateCategory: updateCategoryInStore,
    removeCategory: removeCategoryFromStore,
    addSubcategory: addSubcategoryToStore,
    updateSubcategory: updateSubcategoryInStore,
    removeSubcategory: removeSubcategoryFromStore,
    addCustomField: addCustomFieldToStore,
    updateCustomField: updateCustomFieldInStore,
    removeCustomField: removeCustomFieldFromStore,
    setLoading,
    setSeeded,
  } = useCategoryStore();
  const userId = useAuthStore((s) => s.user?.id);

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await categoryService.list(userId);
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Seed defaults + fetch on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const init = async () => {
      if (!seeded) {
        try {
          await categoryService.seedDefaults(userId);
          await categoryService.backfillRegistros(userId);
        } catch {
          // Idempotent — safe to ignore duplicate errors
        }
        if (!cancelled) setSeeded(true);
      }
      if (!cancelled) await fetchCategories();
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const createCategory = useCallback(
    async (input: CategoryInput) => {
      if (!userId) return;
      const cat = await categoryService.create(userId, input);
      addCategory(cat);
      return cat;
    },
    [userId],
  );

  const updateCategory = useCallback(async (id: string, input: Partial<CategoryInput>) => {
    const cat = await categoryService.update(id, input);
    updateCategoryInStore(id, cat);
    return cat;
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    await categoryService.remove(id);
    removeCategoryFromStore(id);
  }, []);

  const createSubcategory = useCallback(
    async (input: SubcategoryInput) => {
      if (!userId) return;
      const sub = await categoryService.createSubcategory(userId, input);
      addSubcategoryToStore(input.category_id, sub);
      return sub;
    },
    [userId],
  );

  const updateSubcategory = useCallback(
    async (categoryId: string, subId: string, input: { name: string }) => {
      const sub = await categoryService.updateSubcategory(subId, input);
      updateSubcategoryInStore(categoryId, subId, sub);
      return sub;
    },
    [],
  );

  const removeSubcategory = useCallback(async (categoryId: string, subId: string) => {
    await categoryService.removeSubcategory(subId);
    removeSubcategoryFromStore(categoryId, subId);
  }, []);

  const createCustomField = useCallback(
    async (input: CustomFieldInput) => {
      if (!userId) return;
      const field = await categoryService.createCustomField(userId, input);
      addCustomFieldToStore(input.category_id, field);
      return field;
    },
    [userId],
  );

  const updateCustomField = useCallback(
    async (
      categoryId: string,
      fieldId: string,
      input: Partial<Pick<CustomFieldInput, 'name' | 'field_type' | 'options'>>,
    ) => {
      const field = await categoryService.updateCustomField(fieldId, input);
      updateCustomFieldInStore(categoryId, fieldId, field);
      return field;
    },
    [],
  );

  const removeCustomField = useCallback(async (categoryId: string, fieldId: string) => {
    await categoryService.removeCustomField(fieldId);
    removeCustomFieldFromStore(categoryId, fieldId);
  }, []);

  /** Look up category color by id. Fallback to accent color. */
  const getCategoryColor = useCallback(
    (categoryId: string | null | undefined): string => {
      if (!categoryId) return '#E08A38';
      const cat = categories.find((c) => c.id === categoryId);
      return cat?.color ?? '#E08A38';
    },
    [categories],
  );

  /** Look up category by id */
  const getCategoryById = useCallback(
    (categoryId: string | null | undefined) => {
      if (!categoryId) return null;
      return categories.find((c) => c.id === categoryId) ?? null;
    },
    [categories],
  );

  /** Look up subcategory by id within a category */
  const getSubcategoryById = useCallback(
    (categoryId: string | null | undefined, subcategoryId: string | null | undefined) => {
      if (!categoryId || !subcategoryId) return null;
      const cat = categories.find((c) => c.id === categoryId);
      return cat?.subcategories.find((s) => s.id === subcategoryId) ?? null;
    },
    [categories],
  );

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
    createCustomField,
    updateCustomField,
    removeCustomField,
    getCategoryColor,
    getCategoryById,
    getSubcategoryById,
  };
}

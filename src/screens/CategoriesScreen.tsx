import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { CategoryAccordionItem } from '@/components/settings/CategoryAccordionItem';
import { CategoryForm } from '@/components/settings/CategoryForm';
import { CustomFieldForm } from '@/components/settings/CustomFieldForm';
import { SubcategoryForm } from '@/components/settings/SubcategoryForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useCategories } from '@/hooks/useCategories';
import { friendlyError } from '@/lib/errorMessages';
import type { CategoryInput, CustomFieldInput } from '@/schemas/category.schema';
import { colors } from '@/theme/tokens';
import type { CategoryCustomField, UserCategory } from '@/types';
import { toast } from '@tamagui/v2-toast';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';

export default function CategoriesScreen() {
  const router = useRouter();
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    removeCategory,
    createSubcategory,
    updateSubcategory,
    removeSubcategory,
    createCustomField,
    updateCustomField,
    removeCustomField,
  } = useCategories();

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null);

  // Confirm dialog state
  const [deleteCatTarget, setDeleteCatTarget] = useState<UserCategory | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<{
    categoryId: string;
    subId: string;
  } | null>(null);
  const [deleteFieldTarget, setDeleteFieldTarget] = useState<{
    categoryId: string;
    fieldId: string;
  } | null>(null);

  // Subcategory form state
  const [showSubForm, setShowSubForm] = useState(false);
  const [subFormCategoryId, setSubFormCategoryId] = useState<string>('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState('');

  // Custom field form state
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldFormCategoryId, setFieldFormCategoryId] = useState<string>('');
  const [editingField, setEditingField] = useState<CategoryCustomField | null>(null);

  // ── Category handlers ──
  const handleCreateCategory = async (data: CategoryInput) => {
    try {
      await createCategory(data);
    } catch (err) {
      toast.error(friendlyError(err, 'Erro ao criar categoria'));
    }
  };

  const handleEditCategory = (cat: UserCategory) => {
    setEditingCategory(cat);
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = async (data: CategoryInput) => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } catch (err) {
      toast.error(friendlyError(err, 'Erro ao atualizar categoria'));
    }
  };

  const handleDeleteCategory = (cat: UserCategory) => setDeleteCatTarget(cat);

  const doDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    try {
      await removeCategory(deleteCatTarget.id);
    } catch (err) {
      toast.error(friendlyError(err, 'Erro ao excluir categoria'));
    }
    setDeleteCatTarget(null);
  };

  // ── Subcategory handlers ──
  const handleAddSubcategory = (categoryId: string) => {
    setSubFormCategoryId(categoryId);
    setEditingSubId(null);
    setEditingSubName('');
    setShowSubForm(true);
  };

  const handleEditSubcategory = (categoryId: string, subId: string, name: string) => {
    setSubFormCategoryId(categoryId);
    setEditingSubId(subId);
    setEditingSubName(name);
    setShowSubForm(true);
  };

  const handleSubcategorySubmit = async (name: string) => {
    if (editingSubId) {
      await updateSubcategory(subFormCategoryId, editingSubId, { name });
    } else {
      await createSubcategory({ name, category_id: subFormCategoryId });
    }
  };

  const handleDeleteSubcategory = (categoryId: string, subId: string) =>
    setDeleteSubTarget({ categoryId, subId });

  const doDeleteSubcategory = async () => {
    if (!deleteSubTarget) return;
    await removeSubcategory(deleteSubTarget.categoryId, deleteSubTarget.subId);
    setDeleteSubTarget(null);
  };

  // ── Custom field handlers ──
  const handleAddCustomField = (categoryId: string) => {
    setFieldFormCategoryId(categoryId);
    setEditingField(null);
    setShowFieldForm(true);
  };

  const handleEditCustomField = (categoryId: string, field: CategoryCustomField) => {
    setFieldFormCategoryId(categoryId);
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleFieldSubmit = async (data: CustomFieldInput) => {
    if (editingField) {
      await updateCustomField(fieldFormCategoryId, editingField.id, {
        name: data.name,
        field_type: data.field_type,
        options: data.options,
      });
    } else {
      await createCustomField(data);
    }
  };

  const handleDeleteCustomField = (categoryId: string, fieldId: string) =>
    setDeleteFieldTarget({ categoryId, fieldId });

  const doDeleteCustomField = async () => {
    if (!deleteFieldTarget) return;
    try {
      await removeCustomField(deleteFieldTarget.categoryId, deleteFieldTarget.fieldId);
    } catch (err) {
      toast.error(friendlyError(err, 'Erro ao excluir campo'));
    }
    setDeleteFieldTarget(null);
  };

  if (loading && categories.length === 0) {
    return (
      <ScreenContainer>
        <LoadingOverlay />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <XStack alignItems="center" gap="$2" marginBottom="$4">
          <View
            onPress={() => router.back()}
            pressStyle={{ opacity: 0.7 }}
            cursor="pointer"
            padding="$1"
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </View>
          <Text color="$color" fontSize="$6" fontWeight="700">
            Gerenciar Categorias
          </Text>
        </XStack>

        {/* Categories list */}
        <YStack gap="$3" marginBottom="$4">
          {categories.map((cat) => (
            <CategoryAccordionItem
              key={cat.id}
              category={cat}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAddSubcategory={handleAddSubcategory}
              onEditSubcategory={handleEditSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
              onAddCustomField={handleAddCustomField}
              onEditCustomField={handleEditCustomField}
              onDeleteCustomField={handleDeleteCustomField}
            />
          ))}
        </YStack>

        {/* Add category */}
        <Button
          variant="primary"
          onPress={() => {
            setEditingCategory(null);
            setShowCategoryForm(true);
          }}
        >
          + Nova Categoria
        </Button>
      </ScrollView>

      {/* Category form modal */}
      <CategoryForm
        visible={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        initialValues={
          editingCategory ? { name: editingCategory.name, color: editingCategory.color } : undefined
        }
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      />

      {/* Subcategory form modal */}
      <SubcategoryForm
        visible={showSubForm}
        onClose={() => {
          setShowSubForm(false);
          setEditingSubId(null);
        }}
        onSubmit={handleSubcategorySubmit}
        initialName={editingSubName}
        title={editingSubId ? 'Editar Subcategoria' : 'Nova Subcategoria'}
      />

      {/* Custom field form modal */}
      <CustomFieldForm
        visible={showFieldForm}
        onClose={() => {
          setShowFieldForm(false);
          setEditingField(null);
        }}
        onSubmit={handleFieldSubmit}
        categoryId={fieldFormCategoryId}
        initialValues={editingField ?? undefined}
        title={editingField ? 'Editar Campo' : 'Novo Campo'}
      />

      <ConfirmDialog
        open={!!deleteCatTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteCatTarget(null);
        }}
        title="Excluir categoria"
        description={`Excluir "${deleteCatTarget?.name}" e todas as suas subcategorias e campos?`}
        confirmLabel="Excluir"
        destructive
        onConfirm={doDeleteCategory}
      />

      <ConfirmDialog
        open={!!deleteSubTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteSubTarget(null);
        }}
        title="Excluir subcategoria"
        description="Excluir esta subcategoria?"
        confirmLabel="Excluir"
        destructive
        onConfirm={doDeleteSubcategory}
      />

      <ConfirmDialog
        open={!!deleteFieldTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteFieldTarget(null);
        }}
        title="Excluir campo"
        description="Excluir este campo personalizado? Os valores já preenchidos nos registros serão mantidos."
        confirmLabel="Excluir"
        destructive
        onConfirm={doDeleteCustomField}
      />
    </ScreenContainer>
  );
}

import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido (ex: #FF5733)'),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const subcategorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Máximo 50 caracteres'),
  category_id: z.string().min(1, 'Categoria obrigatória'),
});

export type SubcategoryInput = z.infer<typeof subcategorySchema>;

const fieldTypeEnum = z.enum(['text', 'textarea', 'number', 'checkbox', 'select', 'rating']);

export const customFieldSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Máximo 50 caracteres'),
  field_type: fieldTypeEnum,
  options: z.array(z.string().min(1)).default([]),
  category_id: z.string().min(1, 'Categoria obrigatória'),
});

export type CustomFieldInput = z.infer<typeof customFieldSchema>;

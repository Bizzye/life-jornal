import { LIMITS } from '@/lib/constants';
import { z } from 'zod';

export const entrySchema = z.object({
  category_id: z.string().min(1, 'Categoria obrigatória'),
  subcategory_id: z.string().optional(),
  title: z
    .string()
    .min(1, 'Título obrigatório')
    .max(LIMITS.TITLE_MAX, `Máximo ${LIMITS.TITLE_MAX} caracteres`),
  body: z
    .string()
    .max(LIMITS.DESCRIPTION_MAX, `Máximo ${LIMITS.DESCRIPTION_MAX} caracteres`)
    .optional(),
  event_date: z.string().min(1, 'Data obrigatória'),
  event_time: z.string().min(1, 'Hora obrigatória'),
  photo_urls: z.array(z.string().url()).max(3, 'Máximo 3 fotos').optional(),
  custom_field_values: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export type EntryInput = z.infer<typeof entrySchema>;

import { CATEGORIES, LIMITS } from "@/lib/constants";
import { z } from "zod";

const categoryEnum = z.enum(CATEGORIES as unknown as [string, ...string[]]);

export const entrySchema = z.object({
  category: categoryEnum,
  title: z
    .string()
    .min(1, "Título obrigatório")
    .max(LIMITS.TITLE_MAX, `Máximo ${LIMITS.TITLE_MAX} caracteres`),
  body: z
    .string()
    .max(LIMITS.DESCRIPTION_MAX, `Máximo ${LIMITS.DESCRIPTION_MAX} caracteres`)
    .optional(),
  event_date: z.string().min(1, "Data obrigatória"),
  event_time: z.string().min(1, "Hora obrigatória"),
  photo_urls: z.array(z.string().url()).max(3, "Máximo 3 fotos").optional(),
});

export type EntryInput = z.infer<typeof entrySchema>;

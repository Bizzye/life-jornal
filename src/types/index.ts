export type Category = 'event' | 'food' | 'personal';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'rating';

export interface CategoryCustomField {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  field_type: FieldType;
  options: string[];
  sort_order: number;
  created_at: string;
}

export interface UserSubcategory {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  slug?: string | null;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  subcategories: UserSubcategory[];
  custom_fields: CategoryCustomField[];
}

export type CustomFieldValues = Record<string, string | number | boolean>;

export interface Registro {
  id: string;
  user_id: string;
  category: Category;
  category_id?: string | null;
  subcategory_id?: string | null;
  title: string;
  body?: string | null;
  event_date: string;
  photo_urls: string[];
  custom_field_values?: CustomFieldValues;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  birthday?: string | null;
}

export type Category = "event" | "food" | "personal";

export interface Registro {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  body?: string | null;
  event_date: string;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
}

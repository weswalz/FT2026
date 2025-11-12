export interface MenuRecord {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number | null;
  status?: string | null;
  availability?: string | null;
  image?: string | null;
}

export interface MenuItemRecord {
  id: number;
  menu_id: number;
  section?: string | null;
  name: string;
  description?: string | null;
  price?: string | null;
  tags?: string[];
  dietary_info?: string[];
  display_order?: number | null;
  status?: string | null;
}

export interface MenuWithItems extends MenuRecord {
  sections: Record<string, MenuItemRecord[]>;
}

export function getAllMenus(statusFilter?: string | null): MenuRecord[];
export function getMenuWithItems(slug: string): MenuWithItems | null;

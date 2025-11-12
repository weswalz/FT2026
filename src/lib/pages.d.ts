import type { PageContent } from './content.js';

export type PageRecord = PageContent;

export function getAllPages(statusFilter?: string | null): PageRecord[];
export function getPageBySlug(slug: string): PageRecord | null;
export function getPageById(id: number): PageRecord | null;
export function createPage(data: Record<string, unknown>): number;
export function updatePage(id: number, data: Record<string, unknown>): void;
export function deletePage(id: number): void;

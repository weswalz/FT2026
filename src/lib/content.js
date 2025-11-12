import { getPageBySlug } from './pages.js';

function normalizeSection(section, index) {
  if (!section || typeof section !== 'object') {
    return { key: `section_${index}`, type: 'content', value: section };
  }

  const { type, key, id, slug, name } = section;
  const rawContent = section.content ?? section.value ?? section;
  const value =
    rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent)
      ? { ...rawContent }
      : rawContent;

  const resolvedKey =
    key ||
    id ||
    slug ||
    name ||
    type ||
    `section_${index}`;

  return {
    key: resolvedKey,
    type: type || key || 'content',
    value
  };
}

export function getPageContent(slug) {
  const page = getPageBySlug(slug);
  if (!page) return null;

  const entries = Array.isArray(page.sections)
    ? page.sections.map(normalizeSection)
    : [];

  const sectionMap = {};
  const sectionLists = {};

  entries.forEach((entry) => {
    const { key, type, value } = entry;

    if (key) {
      if (sectionMap[key]) {
        if (!Array.isArray(sectionMap[key])) {
          sectionMap[key] = [sectionMap[key]];
        }
        sectionMap[key].push(value);
      } else {
        sectionMap[key] = value;
      }
    }

    if (type) {
      if (!sectionLists[type]) {
        sectionLists[type] = [];
      }
      sectionLists[type].push(value);
    }
  });

  return {
    ...page,
    sectionsRaw: page.sections,
    sectionMap,
    sectionLists
  };
}

export function pickSection(page, key, fallback = null) {
  if (!page) return fallback;
  const value = page.sectionMap?.[key];
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

export function listSections(page, key) {
  if (!page) return [];
  if (page.sectionLists?.[key]) {
    return page.sectionLists[key];
  }
  const single = page.sectionMap?.[key];
  if (!single) return [];
  return Array.isArray(single) ? single : [single];
}

export function getSeoMeta(page, fallback = {}) {
  if (!page?.seo_meta) return fallback;
  return {
    ...fallback,
    ...page.seo_meta
  };
}

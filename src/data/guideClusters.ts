/**
 * Reality Check Guide Clusters Data
 * 
 * Content items mapped to clusters for the GuideChatModal
 * Uses existing feedItems as source, filtered and organized by cluster
 */

import { GuideItem } from '@/types/feedboard';
import { feedItems } from './feedItems';

// Filter and map feedItems to GuideItem format
export const GUIDE_CLUSTERS: Record<string, GuideItem[]> = {
  'Zeit & Endlichkeit': feedItems
    .filter(item => item.theme === 'Zeit & Endlichkeit' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Fokus & Flow': feedItems
    .filter(item => item.theme === 'Fokus & Flow' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Sinn & Bedeutung': feedItems
    .filter(item => item.theme === 'Sinn & Bedeutung' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Geld & Wert': feedItems
    .filter(item => item.theme === 'Geld & Wert' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Beziehungen': feedItems
    .filter(item => item.theme === 'Beziehungen' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Selbsterkenntnis': feedItems
    .filter(item => item.theme === 'Selbsterkenntnis' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Wachstum': feedItems
    .filter(item => item.theme === 'Wachstum' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Freiheit & Orte': feedItems
    .filter(item => item.theme === 'Freiheit & Orte' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    })),

  'Kultur & Stimmen': feedItems
    .filter(item => item.theme === 'Kultur & Stimmen' && item.link !== '#')
    .map(item => ({
      id: item.id,
      title: item.title,
      guideComment: item.guideComment || item.guideWhy,
      guideWhy: item.guideWhy,
      link: item.link,
      clusterId: item.theme,
      format: item.format
    }))
};

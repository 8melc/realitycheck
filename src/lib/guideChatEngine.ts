/**
 * Reality Check Guide Chat Engine
 * 
 * Handles prompt matching and content selection for the GuideChatModal
 * Uses existing CLUSTER_CONFIG for colors/icons to avoid duplication
 */

import { GUIDE_RESPONSES } from '@/data/guideResponses';
import { GUIDE_CLUSTERS } from '@/data/guideClusters';
import { CLUSTER_CONFIG } from '@/lib/clusterConfig';
import { GuideResponse, GuideItem, GuideChatResponse, GuideChatContext, GuideConversationTurn, GuideMatchReason } from '@/types/feedboard';
import { findBestGuideResponse } from '@/data/guideResponsesEnhanced';

// German stopwords for text normalization
const STOPWORDS = new Set([
  'der', 'die', 'das', 'und', 'oder', 'aber', 'mit', 'für', 'von', 'zu', 'in', 'auf', 'an', 'bei',
  'ist', 'sind', 'war', 'waren', 'haben', 'hat', 'hatte', 'hatten', 'werden', 'wird', 'wurde',
  'kann', 'können', 'konnte', 'konnten', 'soll', 'sollen', 'sollte', 'sollten', 'muss', 'müssen',
  'darf', 'dürfen', 'durfte', 'durften', 'will', 'wollen', 'wollte', 'wollten', 'mag', 'mögen',
  'möchte', 'möchten', 'wie', 'was', 'wo', 'wann', 'warum', 'weshalb', 'wohin', 'woher',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mein', 'dein', 'sein', 'ihr', 'unser',
  'euer', 'ihr', 'mir', 'dir', 'ihm', 'ihr', 'uns', 'euch', 'ihnen', 'mich', 'dich', 'sich'
]);

// Generate unique conversation ID
const generateConversationId = (): string => {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Session-based conversation context
let conversationContext: GuideChatContext = {
  conversationId: generateConversationId(),
  turns: []
};

/**
 * Normalizes text for keyword matching
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Scores a prompt against a guide response based on keyword matches
 */
function scoreResponse(promptWords: string[], response: GuideResponse): number {
  let score = 0;
  const responseKeywords = response.keywords.map(k => k.toLowerCase());
  
  for (const word of promptWords) {
    if (responseKeywords.includes(word)) {
      score += 2; // Exact match
    } else {
      // Partial match
      for (const keyword of responseKeywords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 1;
          break;
        }
      }
    }
  }
  
  return score;
}

/**
 * Selects top items from a cluster, prioritizing variety and recommended types
 */
function selectTopItems(items: GuideItem[], maxCount: number = 4, recommendedTypes?: string[]): GuideItem[] {
  if (items.length <= maxCount) {
    return items;
  }
  
  // Prioritize items with recommended types
  const sortedItems = items.sort((a, b) => {
    // Primary sort: Events first
    if (a.format === 'Event' && b.format !== 'Event') return -1;
    if (a.format !== 'Event' && b.format === 'Event') return 1;
    
    // Secondary sort: Prefer items with recommended types
    if (recommendedTypes) {
      const aRecommended = recommendedTypes.includes(a.format.toLowerCase());
      const bRecommended = recommendedTypes.includes(b.format.toLowerCase());
      
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
    }
    
    // Tertiary sort by content length
    const aLength = a.guideComment.length;
    const bLength = b.guideComment.length;
    
    if (aLength !== bLength) {
      return bLength - aLength;
    }
    
    // Quaternary sort by title length
    return b.title.length - a.title.length;
  });
  
  return sortedItems.slice(0, maxCount);
}

/**
 * Gets a response variant based on conversation history
 */
function getResponseVariant(responses: GuideResponse[], usedResponseIds: string[]): GuideResponse {
  if (responses.length === 1) {
    return responses[0];
  }
  
  // Try to avoid repeating recently used responses
  const availableResponses = responses.filter(r => !usedResponseIds.includes(r.id));
  
  if (availableResponses.length > 0) {
    return availableResponses[0];
  }
  
  return responses[0];
}

/**
 * Generates match reasons for selected items
 */
function generateMatchReasons(
  items: GuideItem[],
  selectedResponse: GuideResponse,
  promptWords: string[]
): GuideMatchReason[] {
  return items.map(item => {
    // Use the individual guideWhy if available, otherwise generate a meaningful fallback
    if (item.guideWhy && item.guideWhy.trim()) {
      return {
        itemId: item.id,
        reason: item.guideWhy
      };
    }
    
    // Find matching keywords for fallback
    const matchedKeywords = selectedResponse.keywords.filter(keyword =>
      promptWords.some(word => word.includes(keyword) || keyword.includes(word))
    );
    
    const keywordText = matchedKeywords.length > 0
      ? matchedKeywords.slice(0, 2).join(', ')
      : selectedResponse.clusterId;
    
    return {
      itemId: item.id,
      reason: `Du siehst das, weil du gerade "${keywordText}" als Thema gewählt hast und dieser ${item.format.toLowerCase()} echte Tiefe dazu bietet.`
    };
  });
}

/**
 * Generates a unique turn ID
 */
function generateTurnId(prompt: string): string {
  const timestamp = Date.now();
  const promptHash = prompt.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
  return `turn-${timestamp}-${promptHash}`;
}

/**
 * Handles prompt submission and returns matched response and items
 */
export async function handlePrompt(prompt: string): Promise<GuideChatResponse> {
  const trimmedPrompt = prompt.trim();
  
  // Use enhanced matching logic
  const matchedResponse = findBestGuideResponse(trimmedPrompt);
  
  // Convert enhanced response to legacy format for compatibility
  const selectedResponse: GuideResponse = {
    id: matchedResponse.id,
    keywords: matchedResponse.keywords,
    comment: matchedResponse.guide,
    clusterId: matchedResponse.clusterId,
    promptHook: matchedResponse.followUp,
    followUpQuestion: matchedResponse.followUp,
    recommendedTypes: matchedResponse.recommendedTypes
  };
  
  // Get items from the matched cluster
  const clusterItems = GUIDE_CLUSTERS[matchedResponse.clusterId] || [];
  const selectedItems = selectTopItems(clusterItems, 4, matchedResponse.recommendedTypes);
  
  // Generate match reasons using the enhanced why field
  const matchReasons = selectedItems.map(item => ({
    itemId: item.id,
    reason: item.guideWhy || matchedResponse.why
  }));
  
  // Create new conversation turn
  const newTurn: GuideConversationTurn = {
    id: generateTurnId(trimmedPrompt),
    prompt: trimmedPrompt,
    promptEcho: `„${trimmedPrompt}"`,
    comment: matchedResponse.guide,
    followUp: matchedResponse.followUp,
    matchReasons,
    items: selectedItems,
    createdAt: new Date().toISOString()
  };
  
  // Add turn to conversation context
  conversationContext.turns.push(newTurn);
  
  return {
    conversationId: conversationContext.conversationId,
    turns: [...conversationContext.turns],
    activeTurn: newTurn
  };
}

/**
 * Gets cluster configuration for a given cluster ID
 */
export function getClusterConfig(clusterId: string) {
  return CLUSTER_CONFIG[clusterId] || CLUSTER_CONFIG['Fokus & Flow'];
}

/**
 * Resets conversation context (for new sessions)
 */
export function resetConversationContext(): void {
  conversationContext = {
    conversationId: generateConversationId(),
    turns: []
  };
}

/**
 * Gets current conversation turns
 */
export function getConversationTurns(): GuideConversationTurn[] {
  return [...conversationContext.turns];
}

/**
 * Gets current conversation context
 */
export function getConversationContext(): GuideChatContext {
  return {
    conversationId: conversationContext.conversationId,
    turns: [...conversationContext.turns]
  };
}

/**
 * Tracks feedback for analytics
 */
export function trackFeedback(action: string, clusterId: string, prompt: string) {
  console.log('GuideChat Feedback:', { action, clusterId, prompt, timestamp: new Date().toISOString() });
}

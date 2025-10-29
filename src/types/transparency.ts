/**
 * RealityCheck Transparenz System Type Definitions
 * 
 * TypeScript Interfaces für das Transparenz-Grid System
 */

export interface TransparencyTile {
  id: string;
  title: string;
  shortText: string;
  longText: string;
  type: 'accordion' | 'modal';
  color: string;
  icon: string;
}

export interface TransparencyContent {
  tiles: TransparencyTile[];
}

export interface TransparencyGridProps {
  tiles: TransparencyTile[];
}

export interface TransparencyTileProps {
  tile: TransparencyTile;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
  onOpenModal?: (tile: TransparencyTile) => void;
}

export interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile: TransparencyTile | null;
  content?: string;
}

// Type Guards
export function isAccordionTile(tile: TransparencyTile): boolean {
  return tile.type === 'accordion';
}

export function isModalTile(tile: TransparencyTile): boolean {
  return tile.type === 'modal';
}

// Markdown Content Types
export interface MarkdownContent {
  content: string;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
  };
}

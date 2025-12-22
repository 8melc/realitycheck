'use client';

import { useState, useEffect } from 'react';
import { TransparencyTile as TransparencyTileType } from '@/types/transparency';
import TransparencyTile from './TransparencyTile';
import TransparencyModal from './TransparencyModal';
import { loadSourcesContent } from '@/lib/markdownService';

interface TransparencyGridProps {
  tiles: TransparencyTileType[];
}

export default function TransparencyGrid({ tiles }: TransparencyGridProps) {
  const [activeModal, setActiveModal] = useState<TransparencyTileType | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTile, setExpandedTile] = useState<string | null>(null);

  const handleOpenModal = async (tile: TransparencyTileType) => {
    if (tile.id === 'ki-quellen-transparenz') {
      setIsLoading(true);
      setActiveModal(tile);
      
      try {
        const content = await loadSourcesContent();
        // content.content kann leer sein, wenn Dateien nicht gefunden wurden
        setModalContent(content.content || '');
      } catch (error) {
        console.error('Error loading sources content:', error);
        // Kein throw - setze leeren String, Modal zeigt Fallback-Nachricht
        setModalContent('');
      } finally {
        setIsLoading(false);
      }
    } else {
      // All other tiles show their longText in modal
      setActiveModal(tile);
      setModalContent(tile.longText || tile.shortText);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalContent('');
  };

  const handleToggleAccordion = (tileId: string) => {
    setExpandedTile(expandedTile === tileId ? null : tileId);
  };

  return (
    <>
      {/* Grid Container */}
      <div className="transparency-grid">
        {tiles.map((tile) => (
          <TransparencyTile
            key={tile.id}
            tile={tile}
            onOpenModal={handleOpenModal}
            onToggleAccordion={handleToggleAccordion}
            isExpanded={expandedTile === tile.id}
          />
        ))}
      </div>

      {/* Modal */}
      <TransparencyModal
        isOpen={activeModal !== null}
        onClose={handleCloseModal}
        tile={activeModal}
        content={isLoading ? undefined : modalContent}
      />
    </>
  );
}

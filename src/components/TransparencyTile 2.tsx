'use client';

import { useState } from 'react';
import { TransparencyTile as TransparencyTileType, isAccordionTile, isModalTile } from '@/types/transparency';

interface TransparencyTileProps {
  tile: TransparencyTileType;
  onOpenModal?: (tile: TransparencyTileType) => void;
  onToggleAccordion?: (tileId: string) => void;
  isExpanded?: boolean;
}

export default function TransparencyTile({ tile, onOpenModal, onToggleAccordion, isExpanded = false }: TransparencyTileProps) {
  const handleClick = () => {
    if (isAccordionTile(tile) && onToggleAccordion) {
      onToggleAccordion(tile.id);
    } else if (isModalTile(tile) && onOpenModal) {
      onOpenModal(tile);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="transparency-tile"
      style={{ '--tile-color': tile.color } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isAccordionTile(tile) ? isExpanded : undefined}
      aria-label={`${tile.title} - ${isAccordionTile(tile) ? 'Klicken zum Aufklappen' : 'Klicken für Details'}`}
    >
      {/* Kachel Header */}
      <div className="tile-header">
        <div className="tile-icon" aria-hidden="true">
          {tile.icon}
        </div>
        <h3 className="tile-title">{tile.title}</h3>
        {isAccordionTile(tile) && (
          <div className="tile-arrow" aria-hidden="true">
            {isExpanded ? '−' : '+'}
          </div>
        )}
      </div>

      {/* Kachel Content */}
      <div className="tile-content">
        <p className="tile-short-text">{tile.shortText}</p>
        
        {/* Accordion Content */}
        {isAccordionTile(tile) && (
          <div className={`tile-accordion ${isExpanded ? 'expanded' : ''}`}>
            <div className="tile-accordion-content">
              <p className="tile-long-text">{tile.longText}</p>
            </div>
          </div>
        )}

        {/* Modal Indicator - Only for KI-Quellen */}
        {isModalTile(tile) && (
          <div className="tile-modal-indicator">
            <span className="modal-text">Klicken für vollständige Quellen</span>
            <span className="modal-arrow" aria-hidden="true">→</span>
          </div>
        )}

        {/* Accordion Trigger - Only for accordion tiles */}
        {isAccordionTile(tile) && (
          <div className="tile-accordion-trigger">
            <span className="accordion-text">
              {isExpanded ? 'Weniger' : 'Mehr erfahren'}
            </span>
            <span className="accordion-arrow" aria-hidden="true">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="tile-overlay" aria-hidden="true" />
    </div>
  );
}

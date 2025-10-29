'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { TransparencyTile } from '@/types/transparency';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile: TransparencyTile | null;
  content?: string;
}

export default function TransparencyModal({ isOpen, onClose, tile, content }: TransparencyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Focus close button
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !tile) {
    return null;
  }

  return (
    <div
      className="transparency-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
    >
      <div className="transparency-modal" ref={modalRef}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon" aria-hidden="true">
              {tile.icon}
            </div>
            <h2 id="modal-title" className="modal-title">
              {tile.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Modal schließen"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {/* Modal Content */}
        <div id="modal-content" className="modal-content">
          {content ? (
            <div className="modal-markdown">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
                  h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
                  p: ({ children }) => <p className="markdown-p">{children}</p>,
                  ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
                  ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
                  li: ({ children }) => <li className="markdown-li">{children}</li>,
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="markdown-link"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="markdown-blockquote">{children}</blockquote>
                  ),
                  code: ({ children }) => <code className="markdown-code">{children}</code>,
                  pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="modal-loading">
              <div className="loading-spinner" aria-hidden="true" />
              <p>Lade Inhalte...</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

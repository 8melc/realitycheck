'use client'

import { FilterOptions } from '@/types/people'

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: string[];
}

export default function FilterBar({ filters, onFilterChange, availableTags }: FilterBarProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      lebensziel: '',
      branche: '',
      erfahrung: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Define filter options based on available tags
  const lebenszielOptions = [
    'Ortsunabhängigkeit',
    'Work-Life-Balance',
    'Karrierewechsel',
    'Selbstfindung',
    'Gesellschaftlicher Impact'
  ];

  const brancheOptions = [
    'Tech',
    'Krypto',
    'Kunst',
    'Gesundheit',
    'Gesellschaft',
    'Nachhaltigkeit'
  ];

  const erfahrungOptions = [
    'Anfänger',
    'Erfahren',
    'Experte',
    'Quereinsteiger'
  ];

  return (
    <div className="filter-bar">
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="lebensziel">Lebensziel</label>
          <select
            id="lebensziel"
            value={filters.lebensziel}
            onChange={(e) => handleFilterChange('lebensziel', e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Lebensziele</option>
            {lebenszielOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="branche">Branche</label>
          <select
            id="branche"
            value={filters.branche}
            onChange={(e) => handleFilterChange('branche', e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Branchen</option>
            {brancheOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="erfahrung">Erfahrung</label>
          <select
            id="erfahrung"
            value={filters.erfahrung}
            onChange={(e) => handleFilterChange('erfahrung', e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Erfahrungsstufen</option>
            {erfahrungOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="clear-filters"
            onClick={clearFilters}
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      <style jsx>{`
        .filter-bar {
          margin-bottom: 40px;
        }

        .filter-container {
          display: flex;
          gap: 20px;
          align-items: end;
          flex-wrap: wrap;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
        }

        .filter-group {
          flex: 1;
          min-width: 200px;
        }

        .filter-group label {
          display: block;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--fyf-cream);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--fyf-cream);
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--fyf-mint);
          background: rgba(78, 205, 196, 0.05);
        }

        .filter-select option {
          background: var(--fyf-carbon);
          color: var(--fyf-cream);
        }

        .clear-filters {
          padding: 12px 20px;
          background: transparent;
          color: var(--fyf-coral);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .clear-filters:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: var(--fyf-coral);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .filter-container {
            flex-direction: column;
            gap: 16px;
          }

          .filter-group {
            min-width: auto;
          }

          .clear-filters {
            align-self: stretch;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .filter-container {
            padding: 16px;
          }

          .filter-group label {
            font-size: 0.8rem;
          }

          .filter-select {
            padding: 10px 12px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

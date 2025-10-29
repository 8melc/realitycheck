'use client';

import { useGuideStore, getNudgingFrequencyInfo } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';
import './GuideSettings.css';

export default function GuideSettings() {
  const {
    tone,
    setTone,
    guideActive,
    toggleGuide,
    nudgingFrequency,
    setNudgingFrequency,
  } = useGuideStore();

  const nudgingInfo = getNudgingFrequencyInfo(nudgingFrequency) || {
    label: 'Standard',
    description: 'Der Guide gibt dir gelegentlich Anstöße.',
    explanation: 'Der Guide gibt dir gelegentlich Anstöße.'
  };

  return (
    <div className="guide-settings">
      <div className="guide-settings-header">
        <h3 className="guide-settings-title">
          {getGuideText('guideSettingsTitle', tone)}
        </h3>
        <p className="guide-settings-description">
          {getGuideText('nudgingDescription', tone)}
        </p>
      </div>

      <div className="guide-settings-content">
        {/* Ton-Kalibrierung */}
        <div className="guide-settings-section">
          <h4 className="guide-settings-section-title">Ton-Kalibrierung</h4>
          <div className="guide-tone-buttons">
            <button
              type="button"
              className={`guide-tone-button ${tone === 'straight' ? 'active' : ''}`}
              onClick={() => setTone('straight')}
            >
              {getGuideText('toneStraight', tone)}
            </button>
            <button
              type="button"
              className={`guide-tone-button ${tone === 'soft' ? 'active' : ''}`}
              onClick={() => setTone('soft')}
            >
              {getGuideText('toneSoft', tone)}
            </button>
          </div>
          <div className="guide-tone-status">
            <span className="guide-tone-indicator">
              {getGuideText('toneActive', tone)}
            </span>
          </div>
        </div>

        {/* Nudging-Frequenz */}
        <div className="guide-settings-section">
          <h4 className="guide-settings-section-title">
            {getGuideText('nudgingTitle', tone)}
          </h4>
          <div className="guide-nudging-controls">
            <select
              value={nudgingFrequency}
              onChange={(e) => setNudgingFrequency(e.target.value as any)}
              className="guide-nudging-select"
            >
              <option value="high">Intensiv (3-4 Nudges/Tag)</option>
              <option value="medium">Standard (2-3 Nudges/Tag) - Empfohlen</option>
              <option value="low">Minimal (1 Nudge/Tag)</option>
              <option value="off">Aus (0 Nudges)</option>
            </select>
            <div className="guide-nudging-info">
              <p className="guide-nudging-explanation">
                {nudgingInfo.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Halt die Fresse Button */}
        <div className="guide-settings-section">
          <div className="guide-silence-controls">
            <button
              type="button"
              className={`guide-silence-button ${!guideActive ? 'silenced' : ''}`}
              onClick={toggleGuide}
            >
              {guideActive ? getGuideText('haltDieFresse', tone) : 'Guide aktivieren'}
            </button>
            {!guideActive && (
              <div className="guide-silence-feedback">
                <p>{getGuideText('haltDieFresseFeedback', tone)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
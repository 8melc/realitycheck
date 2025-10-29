'use client'

import { AccessFormData } from '../AccessOnboarding'

interface MusicStepProps {
  formData: AccessFormData
  updateFormData: (updates: Partial<AccessFormData>) => void
}

const genres = [
  { value: 'electronic', label: 'Electronic', icon: '' },
  { value: 'hiphop', label: 'Hip-Hop', icon: '' },
  { value: 'rock', label: 'Rock', icon: '' },
  { value: 'jazz', label: 'Jazz', icon: '' },
  { value: 'classical', label: 'Classical', icon: '' },
  { value: 'ambient', label: 'Ambient', icon: '' },
  { value: 'pop', label: 'Pop', icon: '' },
  { value: 'indie', label: 'Indie', icon: '' }
]

export default function MusicStep({ formData, updateFormData }: MusicStepProps) {
  return (
    <div className="step-content">
      <div className="form-content">
        <div className="form-group">
          <div className="music-genres">
            {genres.map(genre => (
              <div
                key={genre.value}
                className={`option-card ${formData.musicTaste === genre.value ? 'selected' : ''}`}
                onClick={() => updateFormData({ musicTaste: genre.value })}
              >
                <div className="option-card-icon">{genre.icon}</div>
                <div className="option-card-text">{genre.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

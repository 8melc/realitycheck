'use client'

import { useState } from 'react'
import ProgressBar from './ProgressBar'
import StepHeader from './StepHeader'
import IntroStep from './steps/IntroStep'
import BasicsStep from './steps/BasicsStep'
import ZeitPhilosophyStep from './steps/ZeitPhilosophyStep'
import GoalStep from './steps/GoalStep'
import MusicStep from './steps/MusicStep'
import LifestyleStep from './steps/LifestyleStep'
import InterestsStep from './steps/InterestsStep'
import CompleteStep from './steps/CompleteStep'

export interface AccessFormData {
  name: string
  email: string
  birthDate: string
  targetAge: string
  goal: string
  goals: string[]
  timePhilosophy: string
  musicTaste: string
  lifestyle: string
  interests: string[]
}

const steps = [
  {
    id: 'intro',
    navLabel: 'Start',
    heading: 'Willkommen bei FYF',
    microcopy: 'Deine Zeit läuft. Entscheide, was zählt.',
    content: 'intro'
  },
  {
    id: 'basics',
    navLabel: 'Basics',
    heading: 'Wer bist du?',
    microcopy: 'Die Basis für dein Profil – kurz, klar, ohne Schnickschnack.',
    content: 'basics'
  },
  {
    id: 'zeit',
    navLabel: 'Zeit-Philosophie',
    heading: 'Wie denkst du über Zeit?',
    microcopy: 'Deine Haltung zur Zeit prägt jeden Impuls, den wir dir geben.',
    content: 'zeit'
  },
  {
    id: 'goal',
    navLabel: 'Ziel',
    heading: 'Dein Ziel',
    microcopy: 'Kein Marketing-Bullshit, kein Fremdzweck. Nur du, radikal und ehrlich.',
    content: 'goal'
  },
  {
    id: 'musik',
    navLabel: 'Musik-DNA',
    heading: 'Was hörst du?',
    microcopy: 'Was dich bewegt, formt deinen Flow.',
    content: 'musik'
  },
  {
    id: 'lifestyle',
    navLabel: 'Lebensstil',
    heading: 'Wie lebst du?',
    microcopy: 'Dein Stil. Deine Zeitlogik. Wir justieren den Guide so, dass er in deinem Alltag wirkt.',
    content: 'lifestyle'
  },
  {
    id: 'interests',
    navLabel: 'Interessen',
    heading: 'Was interessiert dich?',
    microcopy: 'Mehr Klarheit, besserer Feed, weniger Algorithmus.',
    content: 'interests'
  },
  {
    id: 'complete',
    navLabel: 'Abschluss',
    heading: 'Das ist FYF.',
    microcopy: 'Keine App. Kein Tool. Dein System, um Zeit als Vermögen zu verstehen – und bewusst einzusetzen.',
    content: 'complete'
  }
]

export default function AccessOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<AccessFormData>({
    name: '',
    email: '',
    birthDate: '',
    targetAge: '',
    goal: '',
    goals: [],
    timePhilosophy: '',
    musicTaste: '',
    lifestyle: '',
    interests: []
  })

  const step = steps[currentStep]

  const updateFormData = (updates: Partial<AccessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (step.id) {
      case 'basics':
        return !!(formData.name && formData.email && formData.birthDate)
      case 'zeit':
        return !!formData.timePhilosophy
      case 'goal':
        return !!(formData.goal.trim() || formData.goals.length > 0)
      case 'lifestyle':
        return !!formData.lifestyle
      case 'interests':
        return formData.interests.length > 0
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (step.content) {
      case 'intro':
        return <IntroStep />
      case 'basics':
        return <BasicsStep formData={formData} updateFormData={updateFormData} />
      case 'zeit':
        return <ZeitPhilosophyStep formData={formData} updateFormData={updateFormData} />
      case 'goal':
        return <GoalStep formData={formData} updateFormData={updateFormData} />
      case 'musik':
        return <MusicStep formData={formData} updateFormData={updateFormData} />
      case 'lifestyle':
        return <LifestyleStep formData={formData} updateFormData={updateFormData} />
      case 'interests':
        return <InterestsStep formData={formData} updateFormData={updateFormData} />
      case 'complete':
        return <CompleteStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="access-container">
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      
      {step.id !== 'complete' && (
        <StepHeader 
          step={step} 
          formData={formData}
          showGoalBadge={currentStep >= 3}
        />
      )}

      <div className="step-container">
        <div className="step-content">
          {renderStepContent()}
        </div>
      </div>

      <div className="step-navigation">
        {currentStep < steps.length - 1 ? (
          <div className="button-area">
            {currentStep === 0 ? (
              <button className="cta-btn primary" onClick={nextStep}>
                Los geht's
              </button>
            ) : (
              <div className="nav-buttons-wrapper">
                <button className="nav-btn secondary" onClick={prevStep}>
                  ← Zurück
                </button>
                <button className="nav-btn primary" onClick={nextStep}>
                  Weiter →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

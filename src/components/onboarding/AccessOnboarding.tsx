'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from './ProgressBar'
import StepHeader from './StepHeader'
import IntroStep from './steps/IntroStep'
import BasicsStep from './steps/BasicsStep'
import FocusStep from '@/components/onboarding/steps/FocusStep'
import BioStep from '@/components/onboarding/steps/BioStep'
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
  goalDirection?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
  timePhilosophy: string
  musicTaste: string
  lifestyle: string
  interests: string[]
  focusTopic: string
  bio: string
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
    id: 'focus',
    navLabel: 'Fokus',
    heading: 'Was ist dein Fokus?',
    microcopy: 'Ein Satz, der beschreibt, was dich aktuell antreibt.',
    content: 'focus'
  },
  {
    id: 'bio',
    navLabel: 'Bio',
    heading: 'Über dich',
    microcopy: 'Kurzer Steckbrief – max. 280 Zeichen für die People-Liste.',
    content: 'bio'
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
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<AccessFormData>({
    name: '',
    email: '',
    birthDate: '',
    targetAge: '',
    goal: '',
    goals: [],
    goalDirection: null,
    timePhilosophy: '',
    musicTaste: '',
    lifestyle: '',
    interests: [],
    focusTopic: '',
    bio: ''
  })

  const step = steps[currentStep]

  const updateFormData = (updates: Partial<AccessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = async () => {
    if (validateCurrentStep()) {
      // Step 9 (interests) ist der letzte Schritt - speichere Profil und leite weiter
      if (currentStep === 8) { // Step 9 ist Index 8 (0-basiert)
        try {
          // Save profile to Supabase
          const response = await fetch('/api/profile/onboarding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              birthDate: formData.birthDate,
              targetAge: formData.targetAge || '80',
              goal: formData.goal,
              goals: formData.goals,
              goalDirection: formData.goalDirection,
              timePhilosophy: formData.timePhilosophy,
              lifestyle: formData.lifestyle,
              guidePersonality: formData.timePhilosophy, // Use timePhilosophy as guide personality for now
              focusTopic: formData.focusTopic,
              bio: formData.bio,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('Failed to save profile:', error);
            // Still redirect even if save fails (graceful degradation)
          }
        } catch (error) {
          console.error('Error saving profile:', error);
          // Still redirect even if save fails (graceful degradation)
        }
        
        router.push('/user/dashboard')
      } else if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
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
      case 'focus':
        return !!formData.focusTopic
      case 'bio':
        return !!formData.bio
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
      case 'focus':
        return <FocusStep formData={formData} updateFormData={updateFormData} />
      case 'bio':
        return <BioStep formData={formData} updateFormData={updateFormData} />
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

      {(currentStep < steps.length - 1 || currentStep === 8) && (
        <div className="navigation-buttons">
          {currentStep === 0 ? (
            <button className="nav-button next" onClick={nextStep}>
              Los geht's
            </button>
          ) : (
            <>
              <button className="nav-button back" onClick={prevStep}>
                ← Zurück
              </button>
              <button 
                className="nav-button next" 
                onClick={nextStep}
                disabled={!validateCurrentStep()}
              >
                {currentStep === 8 ? 'Abschließen →' : 'Weiter →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

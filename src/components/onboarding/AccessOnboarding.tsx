'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from './ProgressBar'
import StepHeader from './StepHeader'
import IntroStep from './steps/IntroStep'
import BasicsStep from './steps/BasicsStep'
import GoalStep from './steps/GoalStep'
import GuideStyleStep from './steps/GuideStyleStep'

export interface AccessFormData {
  name: string
  email: string
  birthDate: string
  targetAge: string
  goal: string
  goalDirection?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
  answerStyle: 'short' | 'medium' | 'long'
  guideTone: 'soft' | 'straight' | 'hard'
}

const steps = [
  {
    id: 'intro',
    navLabel: 'Start',
    heading: 'Willkommen bei RealityCheck',
    microcopy: 'Deine Zeit läuft. Entscheide, was zählt.',
    content: 'intro'
  },
  {
    id: 'basics',
    navLabel: 'Identität',
    heading: 'Wer bist du?',
    microcopy: 'Die Basis für dein Profil – kurz, klar, ohne Schnickschnack.',
    content: 'basics'
  },
  {
    id: 'goal',
    navLabel: 'Ziel',
    heading: 'Dein Ziel',
    microcopy: 'Kein Marketing-Bullshit, kein Fremdzweck. Nur du, radikal und ehrlich.',
    content: 'goal'
  },
  {
    id: 'guide-style',
    navLabel: 'Guide-Stil',
    heading: 'Wie soll dein Guide sein?',
    microcopy: 'Wähle, wie dein Guide mit dir kommuniziert.',
    content: 'guide-style'
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
    goalDirection: null,
    answerStyle: 'medium',
    guideTone: 'straight'
  })

  const step = steps[currentStep]

  // Prefill: Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const profile = data.rawProfile || data.profile;
          if (profile) {
            setFormData(prev => ({
              ...prev,
              name: profile.display_name || prev.name,
              birthDate: profile.birth_date || prev.birthDate,
              targetAge: profile.target_age?.toString() || prev.targetAge,
              goalDirection: profile.goal_direction || prev.goalDirection,
              answerStyle: (profile.answer_style as 'short' | 'medium' | 'long') || 'medium',
              guideTone: profile.guide_tone === 'Soft Touch' ? 'soft' : 
                         profile.guide_tone === 'Hard Truth' ? 'hard' : 
                         'straight',
            }));
            
            // Load primary goal if exists
            if (data.primaryGoalTitle) {
              setFormData(prev => ({
                ...prev,
                goal: data.primaryGoalTitle,
              }));
            }
          }
        }
      } catch (error) {
        // Silently fail - user might not have a profile yet
        console.log('[Onboarding] No existing profile to prefill');
      }
    };
    
    loadProfile();
  }, []);

  const updateFormData = (updates: Partial<AccessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = async () => {
    if (validateCurrentStep()) {
      // Last step (guide-style) - save profile and redirect
      if (currentStep === steps.length - 1) {
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
              goalDirection: formData.goalDirection,
              answerStyle: formData.answerStyle,
              guideTone: formData.guideTone,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error('[Onboarding] Failed to save profile:', {
              status: response.status,
              statusText: response.statusText,
              error: error,
            });
            
            // Show user-friendly error message
            alert(`Fehler beim Speichern: ${error.error || 'Unbekannter Fehler'}\n\nDetails: ${error.details || 'Keine Details verfügbar'}`);
            
            // Don't redirect if save fails - let user try again
            return;
          }
        } catch (error) {
          console.error('[Onboarding] Error saving profile:', error);
          alert(`Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte versuche es erneut.`);
          // Don't redirect if save fails
          return;
        }
        
        // Only redirect if save was successful
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
        return !!(formData.name && formData.email && formData.birthDate && formData.targetAge)
      case 'goal':
        return !!(formData.goal.trim() || formData.goalDirection)
      case 'guide-style':
        return !!(formData.answerStyle && formData.guideTone)
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
      case 'goal':
        return <GoalStep formData={formData} updateFormData={updateFormData} />
      case 'guide-style':
        return <GuideStyleStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="access-container">
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      
      <StepHeader 
        step={step} 
        formData={formData}
        showGoalBadge={currentStep >= 2}
      />

      <div className="step-container">
        <div className="step-content">
          {renderStepContent()}
        </div>
      </div>

      {currentStep < steps.length && (
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
                {currentStep === steps.length - 1 ? 'Abschließen →' : 'Weiter →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

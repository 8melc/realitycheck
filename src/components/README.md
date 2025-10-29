# FYF Components Structure

Based on the **🗺️ FYF User Flow Flowchart**, components are organized by Flowchart Steps and continuous elements.

## Core Step Components

### STEP 2: Login via Geburtsdatum
- `BirthdateLogin.tsx` - Main login component with birthdate input
- `BirthdateForm.tsx` - Form handling and validation
- `SessionManager.tsx` - Cookie/session management

### STEP 3: Life-in-Weeks Visualisierung
- `LifeWeeksGrid.tsx` - Main grid visualization component
- `WeekMetrics.tsx` - "Noch X Sommer", "Noch X Wochenenden" display
- `WeekBox.tsx` - Individual week box component
- `LifeProgress.tsx` - Progress visualization

### STEP 4: Zielsetzung
- `GoalSetting.tsx` - Main goal input component
- `GoalExamples.tsx` - Predefined goal examples
- `GoalProfile.tsx` - Goal display in profile
- `MotivationFeedback.tsx` - Motivational feedback system

### STEP 5: Guide/Content-Feed
- `ContentFeed.tsx` - Main feed component
- `GuideComment.tsx` - AI guide comment overlay
- `ContentCard.tsx` - Individual content item
- `FeedAlgorithm.tsx` - Personalization logic

### STEP 6: Filter-Funktion
- `ContentFilter.tsx` - Filter interface
- `FilterOptions.tsx` - Filter option components
- `LiveFilter.tsx` - Real-time filter updates

### STEP 7: Tageslimit
- `DailyLimit.tsx` - Limit setting component
- `SessionTimer.tsx` - Usage tracking
- `LimitReminder.tsx` - Warning notifications

### STEP 9: Events/Workshops
- `EventListing.tsx` - Event display
- `EventRegistration.tsx` - Registration process
- `TimeRemaining.tsx` - "Noch X Samstage" display

### STEP 10: Credits & Access
- `CreditSystem.tsx` - Credit display and management
- `AccessLimiter.tsx` - Premium feature gating
- `PricingDisplay.tsx` - Transparent pricing

### STEP 11: Payment
- `PaymentFlow.tsx` - Checkout process
- `TransactionHistory.tsx` - Purchase history

## Continuous Elements

### Transparenz & Ethik
- `TransparencyInfo.tsx` - "Warum sehe ich das?" tooltip
- `EthicsOverlay.tsx` - Values and methodology display
- `DataSourceInfo.tsx` - Content source transparency

### Rückmeldung & Motivation
- `FeedbackPrompt.tsx` - Milestone feedback collection
- `MotivationSystem.tsx` - Encouraging messages
- `ProgressCelebration.tsx` - Achievement recognition

### Restzeit-Kachel
- `TimeAwarenessWidget.tsx` - Always-visible time display
- `LifeWeekCounter.tsx` - Current life week
- `GoalProgress.tsx` - Progress toward goals

## Shared Components

### Layout & Navigation
- `Layout.tsx` - Main app layout
- `Navigation.tsx` - App navigation
- `Sidebar.tsx` - Sidebar with time widget

### UI Components
- `Button.tsx` - Standardized buttons
- `Input.tsx` - Form inputs
- `Modal.tsx` - Modal dialogs
- `LoadingSpinner.tsx` - Loading states

## Development Guidelines

### Component Creation
When creating new components, always reference the specific Flowchart Step:

```bash
# Example prompts:
"Create BirthdateLogin component for STEP 2 according to Flowchart To-Do Block"
"Implement LifeWeeksGrid for STEP 3 with grid display and metrics calculation"
"Build GoalSetting component for STEP 4 with goal input and profile integration"
```

### Testing Requirements
Each component must include tests for:
- Step-specific functionality
- User interaction flows
- Integration with continuous elements
- Responsive design
- Accessibility

### Integration Points
Components must connect according to the Flowchart flow:
- Login → Life-Weeks → Goals → Content-Feed
- Continuous elements active across all steps
- Proper state management between steps

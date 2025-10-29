# Reality Check Testing Structure

Based on the **🗺️ Reality Check User Flow Flowchart**, testing is organized by Flowchart Steps with specific requirements for each user touchpoint.

## Testing Framework Setup

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
```

## Step-Specific Testing Requirements

### STEP 2: Login via Geburtsdatum
**Test File**: `__tests__/steps/LoginFlow.test.tsx`

**Test Cases**:
- [ ] Birthdate input validation (valid/invalid dates)
- [ ] Optional target age input handling
- [ ] Cookie/session management
- [ ] Error handling for invalid inputs
- [ ] Successful login flow to STEP 3

**Example Test**:
```typescript
describe('STEP 2: Login via Geburtsdatum', () => {
  test('validates birthdate input correctly', () => {
    // Test date validation logic
  });
  
  test('creates session on successful login', () => {
    // Test session management
  });
});
```

### STEP 3: Life-in-Weeks Visualisierung
**Test File**: `__tests__/steps/LifeWeeksVisualization.test.tsx`

**Test Cases**:
- [ ] Grid calculation accuracy (past/current/remaining weeks)
- [ ] Metrics display ("Noch X Sommer", "Noch X Wochenenden")
- [ ] Visual grid rendering
- [ ] Responsive design across devices
- [ ] Educational impact (motivation, not fear)

### STEP 4: Zielsetzung
**Test File**: `__tests__/steps/GoalSetting.test.tsx`

**Test Cases**:
- [ ] Goal input and validation
- [ ] Goal storage in profile
- [ ] Goal display on dashboard
- [ ] Motivation feedback system
- [ ] Goal modification functionality

### STEP 5: Guide/Content-Feed
**Test File**: `__tests__/steps/ContentFeed.test.tsx`

**Test Cases**:
- [ ] Content feed loading and display
- [ ] Guide comment system
- [ ] Dynamic content updates
- [ ] Feed algorithm personalization
- [ ] Content interaction tracking

### STEP 6: Filter-Funktion
**Test File**: `__tests__/steps/FilterFunction.test.tsx`

**Test Cases**:
- [ ] Filter interface functionality
- [ ] Live feed updates
- [ ] Filter preference storage
- [ ] Reset functionality
- [ ] Format and topic filtering

### STEP 7: Tageslimit
**Test File**: `__tests__/steps/DailyLimit.test.tsx`

**Test Cases**:
- [ ] Limit setting and enforcement
- [ ] Session timer accuracy
- [ ] Reminder system
- [ ] Logout on limit reached
- [ ] Limit modification restrictions

## Continuous Elements Testing

### Transparenz & Ethik
**Test File**: `__tests__/continuous/Transparency.test.tsx`

**Test Cases**:
- [ ] "Warum sehe ich das?" info display
- [ ] Data source transparency
- [ ] Values and methodology visibility
- [ ] Ethics overlay functionality

### Rückmeldung & Motivation
**Test File**: `__tests__/continuous/Feedback.test.tsx`

**Test Cases**:
- [ ] Feedback trigger points
- [ ] Motivation message display
- [ ] Progress celebration
- [ ] Milestone recognition

### Restzeit-Kachel
**Test File**: `__tests__/continuous/TimeAwareness.test.tsx`

**Test Cases**:
- [ ] Always-visible time display
- [ ] Current life week calculation
- [ ] Goal progress tracking
- [ ] Widget responsiveness

## Integration Testing

### User Flow Integration
**Test File**: `__tests__/integration/UserFlow.test.tsx`

**Test Cases**:
- [ ] Complete user journey (STEP 2 → 11)
- [ ] State persistence between steps
- [ ] Continuous elements activation
- [ ] Cross-step data flow

### Component Integration
**Test File**: `__tests__/integration/ComponentIntegration.test.tsx`

**Test Cases**:
- [ ] Component communication
- [ ] Shared state management
- [ ] Event handling across components
- [ ] Layout responsiveness

## Testing Guidelines

### Test Structure
```typescript
describe('Flowchart Step: [STEP_NAME]', () => {
  describe('Core Functionality', () => {
    // Step-specific tests
  });
  
  describe('Integration', () => {
    // Cross-step integration tests
  });
  
  describe('Continuous Elements', () => {
    // Transparency, feedback, time awareness tests
  });
});
```

### Test Data
- Use realistic test data matching Flowchart examples
- Include edge cases (invalid dates, empty goals, etc.)
- Test with different user profiles and goals

### Performance Testing
- Component rendering performance
- Large dataset handling (life weeks grid)
- Real-time updates (session timer, feed updates)

## Running Tests

```bash
# Run all tests
npm test

# Run specific step tests
npm test -- --testPathPattern="steps/LoginFlow"

# Run continuous elements tests
npm test -- --testPathPattern="continuous"

# Run integration tests
npm test -- --testPathPattern="integration"
```

## Test Coverage Goals

- **Core Steps (2-7)**: 90%+ coverage
- **High Priority Steps (9-11)**: 85%+ coverage
- **Continuous Elements**: 95%+ coverage
- **Integration Tests**: 80%+ coverage

## Mock Data

Create realistic test data based on Flowchart examples:
- Sample birthdates and target ages
- Example goals ("Weltreise sparen", "Fit bleiben")
- Content feed samples
- Event listings
- Credit system scenarios

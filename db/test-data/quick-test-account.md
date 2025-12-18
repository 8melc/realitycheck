# Quick Test Account

## Login-Daten

**Email:** `testuser@realitycheck.com`  
**Password:** `test123!`

## Profil-Daten

- **Name:** Test User
- **Geburtsdatum:** 15. Januar 1990
- **Zielalter:** 80 Jahre
- **Guide Personality:** Zeit als Investition
- **Ziel:** RealityCheck erfolgreich testen

## Setup-Schritte

### Option 1: Via Signup (empfohlen)

1. Gehe zu `/signup`
2. Registriere mit:
   - Email: `testuser@realitycheck.com`
   - Password: `test123!`
3. Gehe durch Onboarding
4. Profil wird automatisch erstellt

### Option 2: Manuell in Supabase

1. **Auth User erstellen:**
   - Supabase Dashboard → Authentication → Users → Add User
   - Email: `testuser@realitycheck.com`
   - Password: `test123!`
   - Auto Confirm: ✅

2. **User-ID holen:**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'testuser@realitycheck.com';
   ```

3. **Profil erstellen:**
   ```sql
   INSERT INTO public.user_profiles (
     user_id,
     display_name,
     birth_date,
     target_age,
     guide_personality
   ) VALUES (
     'DEINE_USER_ID_HIER', -- ← Aus Schritt 2
     'Test User',
     '1990-01-15',
     80,
     'Zeit als Investition'
   );
   ```

4. **Optional: Goal erstellen:**
   ```sql
   INSERT INTO public.user_goals (
     user_id,
     title,
     is_primary,
     status
   ) VALUES (
     'DEINE_USER_ID_HIER',
     'RealityCheck erfolgreich testen',
     true,
     'active'
   );
   ```

## Weitere Test-Accounts

### Account 2: Demo User
- **Email:** `demo@realitycheck.com`
- **Password:** `demo123!`
- **Name:** Demo User
- **Geburtsdatum:** 1985-05-20
- **Zielalter:** 75

### Account 3: Admin Test
- **Email:** `admin@realitycheck.com`
- **Password:** `admin123!`
- **Name:** Admin Test
- **Geburtsdatum:** 1992-12-01
- **Zielalter:** 85

## Test-Szenarien

### Szenario 1: Neuer User (ohne Profil)
1. Login mit `testuser@realitycheck.com`
2. Sollte zu `/onboarding` weiterleiten
3. Onboarding abschließen
4. Sollte zu `/user/dashboard` weiterleiten

### Szenario 2: User mit Profil
1. Login mit Account der bereits Profil hat
2. Sollte direkt zu `/user/dashboard` gehen
3. Profil-Daten sollten angezeigt werden

### Szenario 3: Logout
1. Klick auf Logout-Button in Nav
2. Sollte zu `/login` weiterleiten
3. Auth-Status sollte zurückgesetzt sein

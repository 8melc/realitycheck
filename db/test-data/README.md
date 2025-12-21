# Test-Account Setup

## Schnell-Setup via API (empfohlen)

### Schritt 1: Service Role Key prüfen

Stelle sicher, dass `SUPABASE_SERVICE_ROLE_KEY` in deiner `.env.local` gesetzt ist:

```bash
# In .env.local
SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key_hier
```

**Wo findest du den Key?**
- Supabase Dashboard → Settings → API → `service_role` key (Secret)

### Schritt 2: API-Route aufrufen

**Option A: Im Browser**
```
http://localhost:3000/api/admin/create-test-user
```
(Methode: POST - nutze z.B. Postman oder curl)

**Option B: Via curl**
```bash
curl -X POST http://localhost:3000/api/admin/create-test-user
```

**Option C: Via Browser Console**
```javascript
fetch('/api/admin/create-test-user', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Schritt 3: Test-Account verwenden

Nach erfolgreichem Setup kannst du dich einloggen mit:

- **Email:** `testuser@realitycheck.com`
- **Password:** `test123!`

## Manuelles Setup (falls API nicht funktioniert)

### Schritt 1: Auth User erstellen

1. Gehe zu Supabase Dashboard → Authentication → Users
2. Klicke "Add User"
3. Email: `testuser@realitycheck.com`
4. Password: `test123!`
5. Auto Confirm: ✅
6. Klicke "Create User"

### Schritt 2: User-ID holen

In Supabase SQL Editor:
```sql
SELECT id, email FROM auth.users WHERE email = 'testuser@realitycheck.com';
```

Kopiere die `id` (UUID).

### Schritt 3: Profil erstellen

```sql
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  birth_date,
  target_age,
  guide_personality
) VALUES (
  'DEINE_USER_ID_HIER', -- ← Ersetze mit UUID aus Schritt 2
  'Test User',
  '1990-01-15',
  80,
  'Zeit als Investition'
);
```

### Schritt 4: Goal erstellen (optional)

```sql
INSERT INTO public.user_goals (
  user_id,
  title,
  is_primary,
  status
) VALUES (
  'DEINE_USER_ID_HIER', -- ← Ersetze mit UUID aus Schritt 2
  'RealityCheck erfolgreich testen',
  true,
  'active'
);
```

## Test-Account Details

- **Email:** testuser@realitycheck.com
- **Password:** test123!
- **Name:** Test User
- **Geburtsdatum:** 15. Januar 1990
- **Zielalter:** 80 Jahre
- **Guide Personality:** Zeit als Investition
- **Ziel:** RealityCheck erfolgreich testen

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not configured"
→ Füge den Service Role Key zu `.env.local` hinzu

### "User already exists"
→ Das ist OK! Die Route aktualisiert das bestehende Profil

### "Failed to create profile"
→ Prüfe RLS-Policies in Supabase


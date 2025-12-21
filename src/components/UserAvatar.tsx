'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types/database.types';

interface UserAvatarProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  displayName?: string; // Optional: if passed, use for initials without fetching
  email?: string; // Optional: if passed, use for seed generation
}

// Generate consistent color from userId
function getColorFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Get initials from display name or email
function getInitials(displayName: string | null | undefined, email: string | null | undefined): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return displayName.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

// Size classes
const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-32 h-32 text-4xl',
};

const sizeClassesImg = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-32 h-32',
};

export default function UserAvatar({ 
  userId, 
  size = 'md', 
  className = '',
  displayName,
  email,
}: UserAvatarProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!!userId); // Only load if userId provided
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProfile() {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('avatar_type, avatar_url, avatar_seed, avatar_style, display_name, user_id')
          .eq('user_id', userId)
          .maybeSingle<UserProfile>();

        if (fetchError) {
          console.error('[UserAvatar] Error fetching profile:', fetchError);
          if (isMounted) {
            setError(fetchError.message);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('[UserAvatar] Error:', err);
        if (isMounted) {
          setError(err.message || 'Fehler beim Laden');
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Use provided displayName/email or fetch from profile
  const finalDisplayName = displayName || profile?.display_name || null;
  const finalEmail = email || null;
  const finalUserId = userId || profile?.user_id || 'default';

  // Determine avatar type (default to initials if not set)
  const avatarType = profile?.avatar_type || 'initials';
  const avatarUrl = profile?.avatar_url;
  const avatarSeed = profile?.avatar_seed || finalEmail || finalUserId;
  const avatarStyle = profile?.avatar_style || 'avataaars';

  // Generate initials
  const initials = getInitials(finalDisplayName, finalEmail);
  const backgroundColor = getColorFromUserId(finalUserId);

  // Loading state
  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full bg-gray-700 animate-pulse`}
        aria-label="Avatar wird geladen"
      />
    );
  }

  // Error state or no userId - show initials fallback
  if (error || !userId) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full border border-rc-mint/60 bg-rc-noir/60 flex items-center justify-center font-semibold uppercase tracking-wide text-rc-mint`}
        style={{ backgroundColor }}
        aria-label={finalDisplayName || 'User'}
      >
        {initials}
      </div>
    );
  }

  // Render based on avatar type
  switch (avatarType) {
    case 'upload':
      if (avatarUrl) {
        return (
          <img
            src={avatarUrl}
            alt={`${finalDisplayName || 'User'} Profilbild`}
            className={`${sizeClassesImg[size]} ${className} rounded-full border border-rc-mint/60 object-cover`}
            onError={(e) => {
              // Fallback to initials on image load error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
        );
      }
      // Fallback to initials if no URL
      return (
        <div
          className={`${sizeClasses[size]} ${className} rounded-full border border-rc-mint/60 bg-rc-noir/60 flex items-center justify-center font-semibold uppercase tracking-wide text-rc-mint`}
          style={{ backgroundColor }}
          aria-label={finalDisplayName || 'User'}
        >
          {initials}
        </div>
      );

    case 'generated':
      const dicebearUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
      return (
        <img
          src={dicebearUrl}
          alt={`${finalDisplayName || 'User'} Avatar`}
          className={`${sizeClassesImg[size]} ${className} rounded-full border border-rc-mint/60 object-cover`}
          onError={(e) => {
            // Fallback to initials on image load error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
          }}
        />
      );

    case 'initials':
    default:
      return (
        <div
          className={`${sizeClasses[size]} ${className} rounded-full border border-rc-mint/60 bg-rc-noir/60 flex items-center justify-center font-semibold uppercase tracking-wide text-rc-mint`}
          style={{ backgroundColor }}
          aria-label={finalDisplayName || 'User'}
        >
          {initials}
        </div>
      );
  }
}


import React from 'react'

interface CrownIconProps {
  size?: number
  className?: string
  variant?: 'filled' | 'outline' | 'gradient'
  animated?: boolean
}

export default function CrownIcon({ 
  size = 48, 
  className = '',
  variant = 'gradient',
  animated = false
}: CrownIconProps) {
  const id = React.useId()
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
      aria-label="Tiara icon"
      role="img"
    >
      <defs>
        {/* Soft rose gold gradient */}
        <linearGradient id={`${id}-rose-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F9A8D4', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#F472B6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Pearl gradient */}
        <radialGradient id={`${id}-pearl`}>
          <stop offset="0%" style={{ stopColor: '#FFFBEB', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FEF3C7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FDE68A', stopOpacity: 0.9 }} />
        </radialGradient>

        {/* Soft glow filter */}
        <filter id={`${id}-soft-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Elegant curved base band */}
      <path
        d="M 20 82 Q 20 78 23 78 L 97 78 Q 100 78 100 82 Q 100 86 97 86 L 23 86 Q 20 86 20 82 Z"
        fill={variant === 'outline' ? 'none' : `url(#${id}-rose-gold)`}
        stroke={variant === 'outline' ? '#F472B6' : 'none'}
        strokeWidth={variant === 'outline' ? '1.5' : '0'}
        opacity="0.95"
      />

      {/* Delicate swirl connectors */}
      <path
        d="M 30 78 Q 35 70 40 62 Q 42 58 45 55"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M 90 78 Q 85 70 80 62 Q 78 58 75 55"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />

      {/* Center elegant peak with flowing curves */}
      <path
        d="M 60 15 Q 58 18 58 22 Q 58 30 60 40 Q 60 50 60 78"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="2"
        fill="none"
        filter={variant === 'gradient' ? `url(#${id}-soft-glow)` : 'none'}
      />

      {/* Left flowing curve */}
      <path
        d="M 40 30 Q 38 35 40 42 Q 42 50 43 78"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1.8"
        fill="none"
        opacity="0.9"
      />

      {/* Right flowing curve */}
      <path
        d="M 80 30 Q 82 35 80 42 Q 78 50 77 78"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1.8"
        fill="none"
        opacity="0.9"
      />

      {/* Decorative swirls */}
      <path
        d="M 50 25 Q 48 28 50 32"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 70 25 Q 72 28 70 32"
        stroke={variant === 'outline' ? '#F472B6' : `url(#${id}-rose-gold)`}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* Pearl details - center pearl (largest) */}
      <circle cx="60" cy="18" r="5" fill={`url(#${id}-pearl)`} opacity="0.95" />
      <circle cx="60" cy="17" r="2" fill="#FFFFFF" opacity="0.6" />
      
      {/* Side pearls */}
      <circle cx="50" cy="28" r="3.5" fill={`url(#${id}-pearl)`} opacity="0.9" />
      <circle cx="49.5" cy="27.5" r="1.5" fill="#FFFFFF" opacity="0.5" />
      
      <circle cx="70" cy="28" r="3.5" fill={`url(#${id}-pearl)`} opacity="0.9" />
      <circle cx="69.5" cy="27.5" r="1.5" fill="#FFFFFF" opacity="0.5" />

      {/* Smaller accent pearls */}
      <circle cx="40" cy="35" r="2.5" fill={`url(#${id}-pearl)`} opacity="0.85" />
      <circle cx="39.5" cy="34.5" r="1" fill="#FFFFFF" opacity="0.4" />
      
      <circle cx="80" cy="35" r="2.5" fill={`url(#${id}-pearl)`} opacity="0.85" />
      <circle cx="79.5" cy="34.5" r="1" fill="#FFFFFF" opacity="0.4" />

      {/* Tiny decorative pearls along curves */}
      <circle cx="45" cy="48" r="1.8" fill={`url(#${id}-pearl)`} opacity="0.7" />
      <circle cx="75" cy="48" r="1.8" fill={`url(#${id}-pearl)`} opacity="0.7" />
      <circle cx="60" cy="55" r="1.8" fill={`url(#${id}-pearl)`} opacity="0.7" />

      {/* Band detail pearls */}
      <circle cx="40" cy="82" r="2" fill={`url(#${id}-pearl)`} opacity="0.8" />
      <circle cx="60" cy="82" r="2" fill={`url(#${id}-pearl)`} opacity="0.8" />
      <circle cx="80" cy="82" r="2" fill={`url(#${id}-pearl)`} opacity="0.8" />

      {/* Delicate sparkles for animation */}
      {animated && (
        <>
          <circle cx="58" cy="14" r="0.8" fill="#FFFBEB" className="animate-ping" opacity="0.8" />
          <circle cx="62" cy="14" r="0.8" fill="#FFFBEB" className="animate-ping" style={{ animationDelay: '0.4s' }} opacity="0.8" />
          <circle cx="60" cy="12" r="0.8" fill="#FEF3C7" className="animate-ping" style={{ animationDelay: '0.2s' }} opacity="0.8" />
        </>
      )}
    </svg>
  )
}

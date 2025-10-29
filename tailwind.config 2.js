/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fyf-noir': '#0A0A0A',
        'fyf-carbon': '#1A1A1A',
        'fyf-charcoal': '#2D2D3F',
        'fyf-smoke': '#3A3A4A',
        'fyf-coral': '#FF6B6B',
        'fyf-coral-dark': '#E55555',
        'fyf-mint': '#4ECDC4',
        'fyf-mint-dark': '#3BA99F',
        'fyf-cream': '#FFF8E7',
        'fyf-bone': '#F5F0E8',
        'fyf-steel': '#B8BCC8',
        'fyf-mauve': '#9B7E9E',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'righteous': ['Righteous', 'cursive'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0A0A0A 0%, #2D2D3F 100%)',
        'gradient-carbon': 'linear-gradient(180deg, #1A1A1A 0%, #2D2D3F 50%, #1A1A1A 100%)',
        'gradient-coral-mint': 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #2D2D3F 0%, #3A3A4A 100%)',
        'gradient-mauve': 'linear-gradient(135deg, #9B7E9E 0%, #FF6B6B 100%)',
      },
      boxShadow: {
        'glow-coral': '0 0 40px rgba(255, 107, 107, 0.3)',
        'glow-mint': '0 0 40px rgba(78, 205, 196, 0.3)',
        'shadow-deep': '0 10px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

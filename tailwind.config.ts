import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '2rem',
  			lg: '4rem',
  			xl: '5rem',
  			'2xl': '6rem'
  		},
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			'opal-blue': {
  				pale: '#E8F2F9',
  				light: '#2E6FA8',
  				DEFAULT: '#1B4B7C',
  				dark: '#123456'
  			},
  			'opal-turquoise': {
  				light: '#7FFFD4',
  				DEFAULT: '#40E0D0',
  				dark: '#20B2AA'
  			},
  			'opal-pink': {
  				light: '#FFD6DD',
  				DEFAULT: '#FFB6C1',
  				dark: '#FF69B4'
  			},
  			'opal-purple': {
  				light: '#C084FC',
  				DEFAULT: '#9B4DCA',
  				dark: '#7C3AED'
  			},
  			'opal-gold': {
  				light: '#F4CF67',
  				DEFAULT: '#D4AF37',
  				dark: '#B8941F'
  			},
  			charcoal: {
  				'40': '#8E8E8E',
  				'60': '#6B6B6B',
  				'80': '#484848',
  				DEFAULT: '#2C2C2C'
  			},
  			cream: {
  				DEFAULT: '#FAF9F6',
  				dark: '#F5F4F1'
  			},
  			'warm-grey': {
  				DEFAULT: '#E8E6E3',
  				light: '#F0EFEC'
  			},
  			/* CSS variable colors - using oklch for modern color accuracy */
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			success: {
  				DEFAULT: 'var(--success)',
  				foreground: 'var(--success-foreground)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning)',
  				foreground: 'var(--warning-foreground)'
  			},
  			/* Chart colors for analytics */
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			/* Sidebar colors */
  			sidebar: {
  				DEFAULT: 'var(--sidebar)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'var(--font-sans)',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'sans-serif'
  			],
  			serif: [
  				'Playfair Display',
  				'Georgia',
  				'serif'
  			],
  			accent: [
  				'Montserrat',
  				'sans-serif'
  			],
  			heading: [
  				'var(--font-heading)',
  				'Playfair Display',
  				'Georgia',
  				'serif'
  			]
  		},
  		fontSize: {
  			'2xs': [
  				'0.625rem',
  				{
  					lineHeight: '0.875rem'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'100': '25rem',
  			'120': '30rem',
  			'128': '32rem',
  			'144': '36rem'
  		},
  		maxWidth: {
  			'8xl': '88rem',
  			'9xl': '96rem'
  		},
  		zIndex: {
  			'60': '60',
  			'70': '70',
  			'80': '80',
  			'90': '90',
  			'100': '100'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-out': {
  				from: {
  					opacity: '1'
  				},
  				to: {
  					opacity: '0'
  				}
  			},
  			'slide-in-from-top': {
  				from: {
  					transform: 'translateY(-100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-bottom': {
  				from: {
  					transform: 'translateY(100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-left': {
  				from: {
  					transform: 'translateX(-100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-in-from-right': {
  				from: {
  					transform: 'translateX(100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			},
  			'zoom-in': {
  				from: {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'zoom-out': {
  				from: {
  					transform: 'scale(1)',
  					opacity: '1'
  				},
  				to: {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				}
  			},
  			'ping-once': {
  				'0%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				},
  				'50%': {
  					transform: 'scale(1.3)',
  					opacity: '0.8'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'fade-out': 'fade-out 0.3s ease-out',
  			'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
  			'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
  			'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
  			'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
  			'zoom-in': 'zoom-in 0.2s ease-out',
  			'zoom-out': 'zoom-out 0.2s ease-out',
  			'ping-once': 'ping-once 0.6s cubic-bezier(0, 0, 0.2, 1)'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-hero': 'linear-gradient(135deg, #1B4B7C 0%, #9B4DCA 50%, #FFB6C1 100%)',
  			'gradient-rings': 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%)',
  			'gradient-necklaces': 'linear-gradient(135deg, #2DD4BF 0%, #06B6D4 50%, #3B82F6 100%)',
  			'gradient-earrings': 'linear-gradient(135deg, #F472B6 0%, #FB7185 50%, #FB923C 100%)',
  			'gradient-bracelets': 'linear-gradient(135deg, #818CF8 0%, #3B82F6 50%, #14B8A6 100%)',
  			'gradient-raw': 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #FB923C 100%)',
  			'gradient-custom': 'linear-gradient(135deg, #475569 0%, #64748B 50%, #1E293B 100%)'
  		}
  	}
  },
  plugins: [
    forms({
      strategy: 'class', // Use class-based form styling
    }),
    typography,
  ],
}

export default config

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-kb-theme="dark"]'],
  content: ["src/**/*.{html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			flexoki: {
  				black: '#100F0F',
  				paper: '#FFFCF0',
  				base: {
  					'50': '#F2F0E5',
  					'100': '#E6E4D9',
  					'150': '#DAD8CE',
  					'200': '#CECDC3',
  					'300': '#B7B5AC',
  					'400': '#9F9D96',
  					'500': '#878580',
  					'600': '#6F6E69',
  					'700': '#575653',
  					'800': '#403E3C',
  					'850': '#343331',
  					'900': '#282726',
  					'950': '#1C1B1A'
  				},
  				light: {
  					bg: '#FFFCF0',
  					'bg-2': '#F2F0E5',
  					ui: '#E6E4D9',
  					'ui-2': '#DAD8CE',
  					'ui-3': '#CECDC3',
  					tx: '#100F0F',
  					'tx-2': '#6F6E69',
  					'tx-3': '#B7B5AC',
  					re: '#AF3029',
  					or: '#BC5215',
  					ye: '#AD8301',
  					gr: '#66800B',
  					cy: '#24837B',
  					bl: '#205EA6',
  					pu: '#5E409D',
  					ma: '#A02F6F',
  					're-2': '#D14D41',
  					'or-2': '#DA702C',
  					'ye-2': '#D0A215',
  					'gr-2': '#879A39',
  					'cy-2': '#3AA99F',
  					'bl-2': '#4385BE',
  					'pu-2': '#8B7EC8',
  					'ma-2': '#CE5D97'
  				},
  				dark: {
  					bg: '#100F0F',
  					'bg-2': '#1C1B1A',
  					ui: '#282726',
  					'ui-2': '#343331',
  					'ui-3': '#403E3C',
  					'tx-3': '#575653',
  					'tx-2': '#878580',
  					tx: '#CECDC3',
  					re: '#D14D41',
  					or: '#DA702C',
  					ye: '#D0A215',
  					gr: '#879A39',
  					cy: '#3AA99F',
  					bl: '#4385BE',
  					pu: '#8B7EC8',
  					ma: '#CE5D97',
  					're-2': '#AF3029',
  					'or-2': '#BC5215',
  					'ye-2': '#AD8301',
  					'gr-2': '#66800B',
  					'cy-2': '#24837B',
  					'bl-2': '#205EA6',
  					'pu-2': '#5E409D',
  					'ma-2': '#A02F6F'
  				},
  				semantic: {
  					'background-main': '#100F0F',
  					'background-alt': '#1C1B1A',
  					'border-base': '#282726',
  					'border-hover': '#343331',
  					'border-active': '#403E3C',
  					'text-faint': '#575653',
  					'text-muted': '#878580',
  					'text-primary': '#CECDC3',
  					'text-error': '#D14D41',
  					'text-warning': '#DA702C',
  					'text-success': '#879A39',
  					'text-link': '#3AA99F',
  					'syntax-constant': '#D0A215',
  					'syntax-variable': '#4385BE',
  					'syntax-number': '#8B7EC8',
  					'syntax-keyword': '#CE5D97'
  				},
  				red: {
  					'50': '#FFE1D5',
  					'100': '#FFCABB',
  					'150': '#FDB2A2',
  					'200': '#F89A8A',
  					'300': '#E8705F',
  					'400': '#D14D41',
  					'500': '#C03E35',
  					'600': '#AF3029',
  					'700': '#942822',
  					'800': '#6C201C',
  					'850': '#551B18',
  					'900': '#3E1715',
  					'950': '#261312'
  				},
  				orange: {
  					'50': '#FFE1D5',
  					'100': '#FFCABB',
  					'150': '#FDB2A2',
  					'200': '#F89A8A',
  					'300': '#E8705F',
  					'400': '#D14D41',
  					'500': '#C03E35',
  					'600': '#AF3029',
  					'700': '#942822',
  					'800': '#6C201C',
  					'850': '#551B18',
  					'900': '#3E1715',
  					'950': '#261312'
  				},
  				yellow: {
  					'50': '#FAEEC6',
  					'100': '#F6E2A0',
  					'150': '#F1D67E',
  					'200': '#ECCB60',
  					'300': '#DFB431',
  					'400': '#D0A215',
  					'500': '#BE9207',
  					'600': '#AD8301',
  					'700': '#8E6B01',
  					'800': '#664D01',
  					'850': '#503D02',
  					'900': '#3A2D04',
  					'950': '#241E08'
  				},
  				green: {
  					'50': '#EDEECF',
  					'100': '#DDE2B2',
  					'150': '#CDD597',
  					'200': '#BEC97E',
  					'300': '#A0AF54',
  					'400': '#879A39',
  					'500': '#768D21',
  					'600': '#66800B',
  					'700': '#536907',
  					'800': '#3D4C07',
  					'850': '#313D07',
  					'900': '#252D09',
  					'950': '#1A1E0C'
  				},
  				cyan: {
  					'50': '#DDF1E4',
  					'100': '#BFE8D9',
  					'150': '#A2DECE',
  					'200': '#87D3C3',
  					'300': '#5ABDAC',
  					'400': '#3AA99F',
  					'500': '#2F968D',
  					'600': '#24837B',
  					'700': '#1C6C66',
  					'800': '#164F4A',
  					'850': '#143F3C',
  					'900': '#122F2C',
  					'950': '#101F1D'
  				},
  				blue: {
  					'50': '#E1ECEB',
  					'100': '#C6DDE8',
  					'150': '#ABCFE2',
  					'200': '#92BFDB',
  					'300': '#66A0C8',
  					'400': '#4385BE',
  					'500': '#3171B2',
  					'600': '#205EA6',
  					'700': '#1A4F8C',
  					'800': '#163B66',
  					'850': '#133051',
  					'900': '#12253B',
  					'950': '#101A24'
  				},
  				purple: {
  					'50': '#F0EAEC',
  					'100': '#E2D9E9',
  					'150': '#D3CAE6',
  					'200': '#C4B9E0',
  					'300': '#A699D0',
  					'400': '#8B7EC8',
  					'500': '#735EB5',
  					'600': '#5E409D',
  					'700': '#4F3685',
  					'800': '#3C2A62',
  					'850': '#31234E',
  					'900': '#261C39',
  					'950': '#1A1623'
  				},
  				magenta: {
  					'50': '#FEE4E5',
  					'100': '#FCCFDA',
  					'150': '#F9B9CF',
  					'200': '#F4A4C2',
  					'300': '#E47DA8',
  					'400': '#CE5D97',
  					'500': '#B74583',
  					'600': '#A02F6F',
  					'700': '#87285E',
  					'800': '#641F46',
  					'850': '#4F1B39',
  					'900': '#39172B',
  					'950': '#24131D'
  				}
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			'collapsible-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--kb-collapsible-content-height)'
  				}
  			},
  			'collapsible-up': {
  				from: {
  					height: 'var(--kb-collapsible-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'caret-blink': {
  				'0%,70%,100%': {
  					opacity: '1'
  				},
  				'20%,50%': {
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'collapsible-down': 'collapsible-down 0.2s ease-out',
  			'collapsible-up': 'collapsible-up 0.2s ease-out',
  			'caret-blink': 'caret-blink 1.25s ease-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

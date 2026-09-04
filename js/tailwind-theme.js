// Initialize dark mode
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

window.toggleDarkMode = function() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

// Inject global Dark Mode styles for a premium, polished aesthetic
const darkModeStyle = document.createElement('style');
darkModeStyle.textContent = `
  /* Deep, rich background for the body */
  .dark body { background-color: #0B0F19 !important; color: #F3F4F6 !important; }
  
  /* Elevated panels and cards */
  .dark .bg-white { background-color: #111827 !important; }
  .dark .bg-gray-50 { background-color: #0B0F19 !important; }
  .dark .bg-gray-100 { background-color: #1F2937 !important; }
  
  /* Subtle borders for depth */
  .dark .border-gray-100, .dark .border-gray-200 { border-color: #1F2937 !important; }
  
  /* Crisp typography */
  .dark .text-gray-900, .dark .text-gray-800 { color: #F9FAFB !important; }
  .dark .text-gray-700, .dark .text-gray-600 { color: #D1D5DB !important; }
  .dark .text-gray-500 { color: #9CA3AF !important; }
  
  /* Form inputs */
  .dark input, .dark textarea, .dark select { 
      background-color: #1F2937 !important; 
      border-color: #374151 !important; 
      color: #F9FAFB !important; 
  }
  .dark input:focus, .dark textarea:focus, .dark select:focus {
      border-color: #6366F1 !important; /* Indigo ring */
  }
  
  /* Flatten aggressive shadows in dark mode for a cleaner look */
  .dark .shadow-sm, .dark .shadow-md, .dark .shadow-lg, .dark .shadow-xl { 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3) !important; 
  }
  
  /* Header transparency */
  .dark header { 
      background-color: rgba(17, 24, 39, 0.85) !important; 
      border-bottom-color: #1F2937 !important;
  }
`;
document.head.appendChild(darkModeStyle);



tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "boxShadow": {
          "skeuo-outset": "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23), inset 0 1px 1px rgba(255,255,255,0.8)",
          "skeuo-inset": "inset 0 3px 6px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.5)",
          "skeuo-btn": "0 4px 6px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.1)",
          "skeuo-btn-active": "inset 0 4px 6px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(255,255,255,0.3)"
        },
        "backgroundImage": {
          "skeuo-metal": "linear-gradient(180deg, #ffffff 0%, #e0e5ec 100%)",
          "skeuo-dark-metal": "linear-gradient(180deg, #495057 0%, #343a40 100%)",
          "skeuo-panel": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          "skeuo-leather": "radial-gradient(circle, #3e2723 0%, #212121 100%)"
        },
        "keyframes": {
          "float": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
          "fade-in-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
          "header-fade-in": { "0%": { opacity: "0", transform: "translate(-50%, 20px)" }, "100%": { opacity: "1", transform: "translate(-50%, 0)" } },
          "pulse-soft": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.8" } }
        },
        "animation": {
          "float": "float 4s ease-in-out infinite",
          "fade-in-up": "fade-in-up 0.6s ease-out forwards",
          "header-fade-in": "header-fade-in 0.6s ease-out forwards",
          "pulse-soft": "pulse-soft 2s ease-in-out infinite"
        },
        "colors": {
          "on-primary-fixed-variant": "#3323cc",
          "primary-fixed-dim": "#c3c0ff",
          "on-secondary-container": "#00714d",
          "on-tertiary": "#ffffff",
          "secondary-fixed-dim": "#4edea3",
          "surface-tint": "#4d44e3",
          "on-primary": "#ffffff",
          "on-surface": "#141b2b",
          "surface": "#f9f9ff",
          "error-container": "#ffdad6",
          "on-tertiary-container": "#ffd4a4",
          "primary": "#3525cd",
          "outline": "#777587",
          "surface-container-low": "#f1f3ff",
          "error": "#ba1a1a",
          "surface-bright": "#f9f9ff",
          "surface-container-high": "#e1e8fd",
          "tertiary-container": "#885500",
          "surface-dim": "#d3daef",
          "background": "#e0e5ec",
          "on-background": "#141b2b",
          "surface-variant": "#dce2f7",
          "surface-container-lowest": "#ffffff",
          "on-secondary-fixed": "#002113",
          "tertiary-fixed": "#ffddb8",
          "tertiary": "#684000",
          "on-tertiary-fixed-variant": "#653e00",
          "secondary": "#006c49",
          "on-secondary-fixed-variant": "#005236",
          "on-surface-variant": "#464555",
          "on-primary-fixed": "#0f0069",
          "secondary-fixed": "#6ffbbe",
          "outline-variant": "#c7c4d8",
          "on-error-container": "#93000a",
          "on-primary-container": "#dad7ff",
          "surface-container-highest": "#dce2f7",
          "on-secondary": "#ffffff",
          "primary-container": "#4f46e5",
          "tertiary-fixed-dim": "#ffb95f",
          "surface-container": "#e9edff",
          "primary-fixed": "#e2dfff",
          "on-error": "#ffffff",
          "inverse-surface": "#293040",
          "on-tertiary-fixed": "#2a1700",
          "inverse-on-surface": "#edf0ff",
          "inverse-primary": "#c3c0ff",
          "secondary-container": "#6cf8bb"
        },
        "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
        },
        "spacing": {
          "margin-mobile": "16px",
          "container-max": "1280px",
          "margin-desktop": "40px",
          "gutter": "24px",
          "unit": "8px"
        },
        "fontFamily": {
          "label-sm": ["Inter"],
          "headline-md": ["Inter"],
          "headline-lg-mobile": ["Inter"],
          "body-md": ["Inter"],
          "headline-xl": ["Inter"],
          "body-sm": ["Inter"],
          "headline-lg": ["Inter"],
          "body-lg": ["Inter"],
          "label-md": ["Inter"]
        },
        "fontSize": {
          "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
          "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
          "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
          "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
          "headline-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
          "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
          "headline-lg": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
          "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
          "label-md": ["14px", { "lineHeight": "20px", "fontWeight": "600" }]
        }
      }
    }
  }

import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors:{primary:"#1F4EB4",mshBlue:"#0057B8",mshOrange:"#F28B30",accent:"#F28B30",success:"#2EAE70"},
      boxShadow:{soft:"0 10px 30px rgba(0,0,0,0.07)"},
      backgroundImage:{"soft-gradient":"linear-gradient(180deg, rgba(31,78,180,0.06), rgba(242,139,48,0.06))"}
    }
  },
  plugins: []
}
export default config

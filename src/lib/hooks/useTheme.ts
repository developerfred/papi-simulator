import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true)

  useEffect(() => {    
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      setIsDarkTheme(storedTheme === 'dark')
      return
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkTheme(prefersDark)

    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkTheme(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkTheme
    setIsDarkTheme(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return { isDarkTheme, toggleTheme }
}
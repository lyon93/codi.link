import { loadCustomTheme } from './theme-loader'

/**
 * Change the color theme used in the workbench.
 * @param {'vs-dark' | 'vs' | 'hc-black' | 'hc-light'} theme
 */
const builtInThemes = ['vs-dark', 'vs', 'hc-black', 'hc-light']

const setTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme)

  const isBuiltInTheme = builtInThemes.includes(theme)
  if (!isBuiltInTheme) {
    loadCustomTheme(theme).catch(error => {
      console.error('Error loading built-in theme:', error)
      // Fallback to default theme
      setTheme('vs')
    })
  }
}

export default setTheme

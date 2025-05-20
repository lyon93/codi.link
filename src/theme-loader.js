import { $ } from './utils/dom.js'
import * as monaco from 'monaco-editor'

/**
 * Load the theme select dropdown with custom themes from themelist.json
 */
export const loadThemeOptions = async () => {
  try {
    // Get the theme select element
    const themeSelect = $('select[name="theme"]')
    if (!themeSelect) {
      console.error('Theme select element not found')
      return
    }

    // Fetch the theme list
    const response = await fetch('/assets/themelist.json')
    if (!response.ok) {
      throw new Error(`Failed to load theme list: ${response.statusText}`)
    }

    const themeList = await response.json()

    // Create optgroup for custom themes
    const customThemesGroup = document.createElement('optgroup')
    customThemesGroup.label = 'Custom Themes'

    // Add themes to the select dropdown
    Object.entries(themeList).forEach(([themeId, theme]) => {
      // Skip the themelist entry itself if it exists
      if (themeId === 'themelist') return

      const option = document.createElement('option')
      option.value = themeId
      option.textContent = theme.name
      customThemesGroup.appendChild(option)
    })

    // Add the option group to the select dropdown
    themeSelect.appendChild(customThemesGroup)
  } catch (error) {
    console.error('Error loading theme options:', error)
  }
}

/**
 * Load a custom theme from the server or remote repository
 * @param {string} themeId - The theme ID to load
 * @returns {Promise<void>}
 */
export const loadCustomTheme = async (themeId) => {
  try {
    // Set the document to loading state
    document.documentElement.setAttribute('data-theme-loading', 'true')

    // Try to fetch from local assets first
    const themeUrl = `../assets/themes/${themeId}.json`
    const response = await fetch(themeUrl)

    // Parse the theme data
    const themeData = await response.json()

    // Define theme in Monaco
    monaco.editor.defineTheme(themeId, themeData)
    monaco.editor.setTheme(themeId)
  } catch (error) {
    console.error('Error loading theme:', error)
    throw error
  } finally {
    // Remove loading state
    document.documentElement.removeAttribute('data-theme-loading')
  }
}

import { registerCompletion } from 'monacopilot'

// Singleton pattern using editor IDs
let activeEditorId = null
let activeCompletion = null

// Create a combined object to hold editor references and file names by language
const editorsByLanguage = {
  html: {
    editor: null,
    fileName: 'index.html'
  },
  css: {
    editor: null,
    fileName: 'style.css'
  },
  javascript: {
    editor: null,
    fileName: 'index.js'
  }
}

const registerEditorInstance = (language, editor) => {
  if (editorsByLanguage[language]) {
    editorsByLanguage[language].editor = editor
  }
}

const registerCodeCompletion = ({ monaco, editor, language }) => {
  // Register this editor in our registry
  registerEditorInstance(language, editor)

  // Generate or get a unique ID for this editor
  const editorId = editor.getId()

  // Create focus handler
  const focusListener = editor.onDidFocusEditorText(() => {
    // Only switch if this is a different editor ID than what's currently active
    if (activeEditorId !== editorId) {
      // Deregister from previous editor
      if (activeEditorId && activeCompletion) {
        try {
          activeCompletion.deregister()
        } catch (e) {
          console.warn(
            'Error de-registering completion from previous editor:',
            e
          )
        }
      }

      // Register with current editor
      activeEditorId = editorId

      try {
        // Get related files by accessing the editors directly
        const relatedFiles = Object.entries(editorsByLanguage)
          .filter(([lang]) => lang !== language) // Filter out current language
          .map(([lang, { editor: ed, fileName }]) => ({
            path: fileName,
            content: ed ? ed.getValue() : ''
          }))

        activeCompletion = registerCompletion(monaco, editor, {
          relatedFiles,
          language,
          endpoint: import.meta.env.VITE_COPILOT_COMPLETION_API
        })
      } catch (e) {
        console.warn('Error registering completion for editor:', e)
        activeCompletion = null
      }
    }
  })

  // Initialize if this is the first editor
  if (!activeEditorId) {
    activeEditorId = editorId
    try {
      activeCompletion = registerCompletion(monaco, editor, {
        language,
        endpoint: import.meta.env.VITE_COPILOT_COMPLETION_API
      })
    } catch (e) {
      console.warn('Error registering initial completion:', e)
      activeCompletion = null
    }
  }

  return {
    deregister: () => {
      // Clean up focus listener
      focusListener.dispose()

      // Deregister if this is the active editor
      if (activeEditorId === editorId && activeCompletion) {
        try {
          activeCompletion.deregister()
          activeEditorId = null
          activeCompletion = null
        } catch (e) {
          console.warn('Error deregistering completion:', e)
        }
      }
    }
  }
}

export default registerCodeCompletion

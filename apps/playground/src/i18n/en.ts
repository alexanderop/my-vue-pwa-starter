// The source catalog. Its literal text types the arguments of each key, and
// `Catalog` in ./index.ts makes every other locale match it key for key.
export const en = {
  app: {
    tagline: 'Your own little corner.',
    offline: 'Offline',
    offlineReady: 'Offline ready',
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
    closeDialog: 'Close dialog',
    dismissNotification: 'Dismiss notification',
    nav: { notes: 'Notes', settings: 'Settings' },
    footer: {
      purpose: 'A little space for what matters.',
      ownership: 'Yours. On this device.',
    },
    update: {
      label: 'App update',
      title: 'A fresh version is ready.',
      busy: 'Save or discard your draft before updating.',
      idle: 'Update when you are ready. Your saved notes stay here.',
      later: 'Later',
      now: 'Update now',
    },
    recovery: {
      title: 'Something went wrong.',
      body: 'Your saved notes remain on this device. Reload to try again. Any unsaved draft may be lost.',
      reload: 'Reload app',
      copy: 'Copy diagnostics',
      copied: 'Diagnostics copied. No notes or personal data are included.',
      copyUnavailable:
        'Copy is unavailable. You can select the diagnostics below.',
      diagnostics: 'Safe diagnostics',
    },
  },
  notes: {
    eyebrow: 'A place to begin',
    title: 'Make room for a thought.',
    description: 'Ideas, reminders, and the things worth keeping.',
    newNote: 'New note',
    search: { label: 'Search notes', placeholder: 'Find a thought…' },
    trash: 'Trash ({n})',
    backToNotes: 'Back to notes',
    count: '{n} note | {n} notes',
    trashCount: '{n} note in Trash | {n} notes in Trash',
    searchSummary: 'Showing {shown} of {total} for “{query}”',
    searchClear: 'Clear',
    tryAgain: 'Try again',
    loading: 'Opening your notebook…',
    empty: {
      title: 'Good things start with a blank page.',
      description:
        'A passing idea. A small reminder. Something just for you. Give it a place to land.',
      action: 'Write your first note',
      footnote: 'Saved on your device. Always yours.',
    },
    noResults: {
      title: 'No thoughts found.',
      trashEmpty: 'Trash is empty.',
      trashEmptyDescription:
        'Notes you delete stay here until you remove them for good.',
      description: 'Try a different word, or start a new note.',
      clear: 'Clear search',
    },
    groups: {
      pinned: 'Pinned',
      rest: 'Everything else',
      all: 'Your notes',
    },
    card: {
      edit: 'Edit {title}',
      pin: 'Pin {title}',
      unpin: 'Unpin {title}',
      delete: 'Delete {title}',
      restore: 'Restore',
      emptyBody: 'A little space to come back to.',
    },
    editor: {
      newTitle: 'New note',
      editTitle: 'Edit note',
      description: 'A little space for whatever is on your mind.',
      title: 'Title',
      titlePlaceholder: 'Give your thought a name',
      body: 'Note',
      bodyPlaceholder: 'Start anywhere…',
      unsaved: 'Unsaved changes',
      stored: 'Stored on this device',
      cancel: 'Cancel',
      save: 'Save note',
      discard: 'Discard your unsaved changes?',
    },
    conflict: {
      explanation:
        'Your draft is still here. Save a separate note, or review the latest saved version before replacing it.',
      saveCopy: 'Save as a new note',
      review: 'Review latest version',
      latest: 'Latest saved version',
      replace: 'Replace latest with my draft',
      deleted:
        'This note was deleted. Save your draft as a new note to keep it.',
    },
    remove: {
      trashTitle: 'Move this note to Trash?',
      trashDescription: 'You can restore this note from Trash at any time.',
      trashAction: 'Delete note',
      permanentTitle: 'Permanently delete this note?',
      permanentDescription:
        'This cannot be undone. Export a backup first if you want to keep it.',
      permanentAction: 'Permanently delete',
      keep: 'Keep note',
    },
    toast: {
      saved: 'Note saved.',
      trashed: 'Note moved to Trash.',
      deleted: 'Note permanently deleted.',
      restored: 'Note restored.',
      undo: 'Undo',
    },
    errors: {
      titleRequired: 'Give your note a title.',
      titleTooLong: 'Keep the title under 121 characters.',
      bodyTooLong: 'Keep the note under 20,001 characters.',
      storageUnavailable:
        'Local storage is unavailable. Keep your draft and try again.',
      storageFailed:
        'Your notes could not be saved or loaded. Please try again.',
      connectionClosed:
        'The notes connection has closed. Keep your draft and reload the app to reconnect.',
      blocked: 'Close other tabs using these notes, then try again.',
      conflict:
        'This note changed in another tab. Reload your notes before trying again.',
      corrupt:
        'Some saved notes could not be read. Your stored data has been left untouched.',
    },
  },
  settings: {
    title: 'Settings',
    back: 'Settings',
    preparing: 'Preparing',
    unavailable: 'Unavailable',
    privacy: 'Your notes stay on this device. Nothing is sent anywhere.',
    groups: { device: 'This device', notes: 'Your notes' },
    appearance: {
      title: 'Appearance',
      preview: 'Preview',
      sampleLabel: 'Note',
      sampleTitle: 'Morning pages',
      sampleBody: 'Slept well. Finish the chapter before lunch.',
      mode: 'Mode',
      accent: 'Accent colour',
      help: 'Changes apply right away and stay on this device.',
      themes: { system: 'System', light: 'Light', dark: 'Dark' },
      accents: {
        blue: 'Blue',
        teal: 'Teal',
        violet: 'Violet',
        pink: 'Pink',
        sand: 'Sand',
      },
      summary: '{theme} · {accent}',
    },
    language: {
      title: 'Language',
      legend: 'Language',
      system: 'System',
      help: 'System follows your browser language. Fieldnotes speaks English and German.',
    },
    saveErrors: {
      StorageQuotaExceeded:
        'Storage is full. This choice lasts until you close the app.',
      StorageUnavailable:
        'This browser blocks saving. This choice lasts until you close the app.',
    },
    install: {
      title: 'Add to Home Screen',
      installed: 'Installed',
      heading: 'Keep Fieldnotes close',
      intro:
        'Open it from your Home Screen like any other app. It works without a connection.',
      installedHere: 'Installed on this device',
      notInstalledHere: 'Not installed on this device',
      action: 'Install Fieldnotes',
      device: 'Your device',
      fallback:
        'If your browser offers no installation option, you can still use Fieldnotes in a tab.',
      platforms: { ios: 'iPhone', android: 'Android', desktop: 'Computer' },
      steps: {
        ios: [
          'Open this page in Safari.',
          'Tap Share, then Add to Home Screen. You may need to scroll through the actions.',
          'Tap Add, then open Fieldnotes from your Home Screen.',
        ],
        android: [
          'Open this page in Chrome.',
          'Open the browser menu and choose Install app or Add to Home screen.',
          'Follow the browser instructions. The wording can vary by device.',
        ],
        desktop: [
          'In Chrome or Edge, look for the install icon in the address bar or Install in the browser menu.',
          'In Safari on a supported Mac, choose File → Add to Dock.',
        ],
      },
    },
    updates: {
      title: 'Updates & offline',
      checking: 'Checking for updates…',
      ready: 'A fresh version is ready',
      current: 'You are up to date',
      offlineUse: 'Offline use',
      offlineSaved: 'The app is saved for offline use.',
      offlinePending:
        'Open the production app online once to prepare offline use.',
      offlineDevBuild: 'Offline use is only available in the production build.',
      version: 'Version {version}',
      check: 'Check for updates',
      help: 'When a new version is ready, you choose when to update. Unsaved drafts are kept.',
      status: {
        updateReady: 'A new version is ready when you are.',
        checking: 'Checking the latest version…',
        upToDate: 'You are up to date.',
        devBuild: 'Offline installation is available in the production build.',
        notReady: 'The app is not ready to check for updates yet.',
        checkFailed:
          'Could not check for updates. Try again when you are online.',
        installManually: 'Use your browser menu to install this app.',
        reloadToUpdate:
          'An update is ready. Save your changes, then update this tab.',
        offlineSetupFailed:
          'Offline setup could not finish. Reopen the app online to try again.',
      },
    },
    backup: {
      working: 'Working on your backup. Keep this page open until it finishes…',
    },
    export: {
      title: 'Export backup',
      heading: 'Back up your notes',
      intro:
        'Download one file with every note, including Trash. Keep it somewhere safe in case this device is lost.',
      includes: 'Includes',
      includesValue: 'All notes and Trash',
      format: 'Format',
      formatValue: 'JSON file',
      limit: 'Limit',
      limitValue: '5,000 notes or 10 MB',
      warning:
        'Backups are plain text. Anyone with the file can read your notes, so store it somewhere private.',
      action: 'Export backup',
      started:
        'Backup download started: {n} note, including trash. Keep it somewhere safe. | Backup download started: {n} notes, including trash. Keep it somewhere safe.',
      failed: 'The backup could not be downloaded. Please try again.',
      tooLarge:
        'This collection exceeds the backup limit of 5,000 notes or 10 MB. No backup was downloaded. Your notes are unchanged.',
    },
    import: {
      title: 'Import backup',
      heading: 'Restore from a backup',
      intro: 'Bring notes back from a Fieldnotes backup file.',
      choose: 'Choose a Fieldnotes backup',
      chooseTitle: 'Choose a backup file',
      hint: '.json · up to 10 MB',
      goodToKnow: 'Good to know',
      copies: 'Notes are added as new copies. Nothing you have is replaced.',
      duplicates: 'Importing the same backup twice creates duplicates.',
      limits: 'Up to 5,000 notes and 10 MB per file.',
      imported:
        'Imported {n} note. Your existing notes were kept. | Imported {n} notes. Your existing notes were kept.',
      empty: 'This backup has no notes to import.',
      failed: 'The backup could not be imported. Please try again.',
      tooLarge: 'Choose a backup smaller than 10 MB.',
      unreadable: 'This file is not readable JSON. Choose a Fieldnotes backup.',
      invalid:
        'Choose a valid Fieldnotes version 1 backup with no more than 5,000 notes.',
    },
  },
} as const

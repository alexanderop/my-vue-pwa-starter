import type { en } from './en'

export const de: typeof en = {
  app: {
    tagline: 'Deine eigene kleine Ecke.',
    offline: 'Offline',
    offlineReady: 'Offline bereit',
    skipToContent: 'Zum Inhalt springen',
    mainNavigation: 'Hauptnavigation',
    closeDialog: 'Dialog schließen',
    dismissNotification: 'Hinweis schließen',
    nav: { notes: 'Notizen', settings: 'Einstellungen' },
    footer: {
      purpose: 'Ein kleiner Platz für das, was zählt.',
      ownership: 'Deins. Auf diesem Gerät.',
    },
    update: {
      label: 'App-Update',
      title: 'Eine neue Version ist bereit.',
      busy: 'Speichere oder verwirf deinen Entwurf vor dem Update.',
      idle: 'Aktualisiere, wann es dir passt. Deine gespeicherten Notizen bleiben hier.',
      later: 'Später',
      now: 'Jetzt aktualisieren',
    },
    recovery: {
      title: 'Etwas ist schiefgelaufen.',
      body: 'Deine gespeicherten Notizen bleiben auf diesem Gerät. Lade neu, um es noch einmal zu versuchen. Ein ungespeicherter Entwurf kann verloren gehen.',
      reload: 'App neu laden',
      copy: 'Diagnose kopieren',
      copied:
        'Diagnose kopiert. Sie enthält keine Notizen und keine persönlichen Daten.',
      copyUnavailable:
        'Kopieren ist nicht verfügbar. Du kannst die Diagnose unten markieren.',
      diagnostics: 'Sichere Diagnose',
    },
  },
  notes: {
    eyebrow: 'Ein Ort zum Anfangen',
    title: 'Schaff Platz für einen Gedanken.',
    description: 'Ideen, Erinnerungen und alles, was es wert ist.',
    newNote: 'Neue Notiz',
    search: { label: 'Notizen durchsuchen', placeholder: 'Gedanken finden…' },
    trash: 'Papierkorb ({n})',
    backToNotes: 'Zurück zu den Notizen',
    count: '{n} Notiz | {n} Notizen',
    tryAgain: 'Erneut versuchen',
    loading: 'Dein Notizbuch wird geöffnet…',
    empty: {
      title: 'Gute Dinge beginnen mit einer leeren Seite.',
      description:
        'Eine flüchtige Idee. Eine kleine Erinnerung. Etwas nur für dich. Gib ihr einen Platz.',
      action: 'Schreib deine erste Notiz',
      footnote: 'Auf deinem Gerät gespeichert. Immer deins.',
    },
    noResults: {
      title: 'Keine Gedanken gefunden.',
      trashEmpty: 'Der Papierkorb ist leer.',
      description: 'Versuch ein anderes Wort oder beginne eine neue Notiz.',
      clear: 'Suche löschen',
    },
    groups: {
      pinned: 'Angeheftet',
      rest: 'Alles andere',
      all: 'Deine Notizen',
    },
    card: {
      edit: '{title} bearbeiten',
      pin: '{title} anheften',
      unpin: '{title} lösen',
      delete: '{title} löschen',
      restore: 'Wiederherstellen',
      pinned: 'Angeheftet',
      emptyBody: 'Ein kleiner Platz zum Zurückkommen.',
    },
    editor: {
      newTitle: 'Neue Notiz',
      editTitle: 'Notiz bearbeiten',
      description: 'Ein kleiner Platz für alles, was dich beschäftigt.',
      title: 'Titel',
      titlePlaceholder: 'Gib deinem Gedanken einen Namen',
      body: 'Notiz',
      bodyPlaceholder: 'Fang irgendwo an…',
      unsaved: 'Ungespeicherte Änderungen',
      stored: 'Auf diesem Gerät gespeichert',
      cancel: 'Abbrechen',
      save: 'Notiz speichern',
      discard: 'Ungespeicherte Änderungen verwerfen?',
    },
    conflict: {
      explanation:
        'Dein Entwurf ist noch da. Speichere ihn als eigene Notiz oder sieh dir die zuletzt gespeicherte Version an, bevor du sie ersetzt.',
      saveCopy: 'Als neue Notiz speichern',
      review: 'Neueste Version ansehen',
      latest: 'Zuletzt gespeicherte Version',
      replace: 'Neueste Version durch meinen Entwurf ersetzen',
      deleted:
        'Diese Notiz wurde gelöscht. Speichere deinen Entwurf als neue Notiz, um ihn zu behalten.',
    },
    remove: {
      trashTitle: 'Diese Notiz in den Papierkorb verschieben?',
      trashDescription:
        'Du kannst diese Notiz jederzeit aus dem Papierkorb wiederherstellen.',
      trashAction: 'Notiz löschen',
      permanentTitle: 'Diese Notiz endgültig löschen?',
      permanentDescription:
        'Das lässt sich nicht rückgängig machen. Exportiere vorher ein Backup, wenn du sie behalten willst.',
      permanentAction: 'Endgültig löschen',
      keep: 'Notiz behalten',
    },
    toast: {
      saved: 'Notiz gespeichert.',
      trashed: 'Notiz in den Papierkorb verschoben.',
      deleted: 'Notiz endgültig gelöscht.',
      restored: 'Notiz wiederhergestellt.',
      undo: 'Rückgängig',
    },
    errors: {
      titleRequired: 'Gib deiner Notiz einen Titel.',
      titleTooLong: 'Halte den Titel unter 121 Zeichen.',
      bodyTooLong: 'Halte die Notiz unter 20.001 Zeichen.',
      storageUnavailable:
        'Der lokale Speicher ist nicht verfügbar. Behalte deinen Entwurf und versuch es noch einmal.',
      storageFailed:
        'Deine Notizen konnten nicht gespeichert oder geladen werden. Bitte versuch es noch einmal.',
      connectionClosed:
        'Die Verbindung zu den Notizen wurde geschlossen. Behalte deinen Entwurf und lade die App neu.',
      blocked:
        'Schließe andere Tabs mit diesen Notizen und versuch es dann noch einmal.',
      conflict:
        'Diese Notiz wurde in einem anderen Tab geändert. Lade deine Notizen neu, bevor du es noch einmal versuchst.',
      corrupt:
        'Einige gespeicherte Notizen konnten nicht gelesen werden. Deine Daten wurden nicht verändert.',
    },
  },
  settings: {
    title: 'Einstellungen',
    back: 'Einstellungen',
    preparing: 'Wird vorbereitet',
    privacy:
      'Deine Notizen bleiben auf diesem Gerät. Nichts wird irgendwohin gesendet.',
    groups: { device: 'Dieses Gerät', notes: 'Deine Notizen' },
    appearance: {
      title: 'Darstellung',
      preview: 'Vorschau',
      sampleLabel: 'Notiz',
      sampleTitle: 'Morgenseiten',
      sampleBody: 'Gut geschlafen. Das Kapitel vor dem Mittag fertig machen.',
      mode: 'Modus',
      accent: 'Akzentfarbe',
      help: 'Änderungen gelten sofort und bleiben auf diesem Gerät.',
      themes: { system: 'System', light: 'Hell', dark: 'Dunkel' },
      accents: {
        blue: 'Blau',
        teal: 'Petrol',
        violet: 'Violett',
        pink: 'Rosa',
        sand: 'Sand',
      },
      summary: '{theme} · {accent}',
    },
    language: {
      title: 'Sprache',
      legend: 'Sprache',
      system: 'System',
      help: 'System folgt der Sprache deines Browsers. Fieldnotes spricht Englisch und Deutsch.',
    },
    saveErrors: {
      StorageQuotaExceeded:
        'Der Speicher ist voll. Diese Auswahl gilt, bis du die App schließt.',
      StorageUnavailable:
        'Dieser Browser blockiert das Speichern. Diese Auswahl gilt, bis du die App schließt.',
    },
    install: {
      title: 'Zum Home-Bildschirm',
      installed: 'Installiert',
      heading: 'Halte Fieldnotes griffbereit',
      intro:
        'Öffne es wie jede andere App von deinem Home-Bildschirm. Es funktioniert ohne Verbindung.',
      installedHere: 'Auf diesem Gerät installiert',
      notInstalledHere: 'Auf diesem Gerät nicht installiert',
      action: 'Fieldnotes installieren',
      device: 'Dein Gerät',
      fallback:
        'Wenn dein Browser keine Installation anbietet, kannst du Fieldnotes trotzdem in einem Tab nutzen.',
      platforms: { ios: 'iPhone', android: 'Android', desktop: 'Computer' },
      steps: {
        ios: [
          'Öffne diese Seite in Safari.',
          'Tippe auf Teilen und dann auf Zum Home-Bildschirm. Eventuell musst du durch die Aktionen scrollen.',
          'Tippe auf Hinzufügen und öffne Fieldnotes dann von deinem Home-Bildschirm.',
        ],
        android: [
          'Öffne diese Seite in Chrome.',
          'Öffne das Browsermenü und wähle App installieren oder Zum Startbildschirm hinzufügen.',
          'Folge den Anweisungen des Browsers. Die Bezeichnungen können je nach Gerät abweichen.',
        ],
        desktop: [
          'Suche in Chrome oder Edge nach dem Installationssymbol in der Adressleiste oder nach Installieren im Browsermenü.',
          'Wähle in Safari auf einem unterstützten Mac Ablage → Zum Dock hinzufügen.',
        ],
      },
    },
    updates: {
      title: 'Updates & Offline',
      checking: 'Suche nach Updates…',
      ready: 'Eine neue Version ist bereit',
      current: 'Du bist auf dem neuesten Stand',
      offlineUse: 'Offline-Nutzung',
      offlineSaved: 'Die App ist für die Offline-Nutzung gespeichert.',
      offlinePending:
        'Öffne die Produktions-App einmal online, um die Offline-Nutzung vorzubereiten.',
      version: 'Version {version}',
      check: 'Nach Updates suchen',
      help: 'Wenn eine neue Version bereit ist, entscheidest du, wann aktualisiert wird. Ungespeicherte Entwürfe bleiben erhalten.',
      status: {
        updateReady: 'Eine neue Version ist bereit, wann immer du willst.',
        checking: 'Die neueste Version wird geprüft…',
        upToDate: 'Du bist auf dem neuesten Stand.',
        devBuild:
          'Die Offline-Installation ist im Produktions-Build verfügbar.',
        notReady: 'Die App kann noch nicht nach Updates suchen.',
        checkFailed:
          'Die Suche nach Updates ist fehlgeschlagen. Versuch es noch einmal, wenn du online bist.',
        installManually:
          'Nutze das Menü deines Browsers, um diese App zu installieren.',
        reloadToUpdate:
          'Ein Update ist bereit. Speichere deine Änderungen und aktualisiere dann diesen Tab.',
        offlineSetupFailed:
          'Die Offline-Einrichtung konnte nicht abgeschlossen werden. Öffne die App online erneut, um es noch einmal zu versuchen.',
      },
    },
    backup: {
      working:
        'Dein Backup wird erstellt. Lass diese Seite geöffnet, bis es fertig ist…',
    },
    export: {
      title: 'Backup exportieren',
      heading: 'Sichere deine Notizen',
      intro:
        'Lade eine Datei mit allen Notizen herunter, einschließlich Papierkorb. Bewahre sie sicher auf, falls dieses Gerät verloren geht.',
      includes: 'Enthält',
      includesValue: 'Alle Notizen und Papierkorb',
      format: 'Format',
      formatValue: 'JSON-Datei',
      limit: 'Limit',
      limitValue: '5.000 Notizen oder 10 MB',
      warning:
        'Backups sind Klartext. Wer die Datei hat, kann deine Notizen lesen. Bewahre sie also an einem privaten Ort auf.',
      action: 'Backup exportieren',
      started:
        'Backup-Download gestartet: {n} Notiz, einschließlich Papierkorb. Bewahre sie sicher auf. | Backup-Download gestartet: {n} Notizen, einschließlich Papierkorb. Bewahre sie sicher auf.',
      failed:
        'Das Backup konnte nicht heruntergeladen werden. Bitte versuch es noch einmal.',
      tooLarge:
        'Diese Sammlung überschreitet das Backup-Limit von 5.000 Notizen oder 10 MB. Es wurde kein Backup heruntergeladen. Deine Notizen sind unverändert.',
    },
    import: {
      title: 'Backup importieren',
      heading: 'Aus einem Backup wiederherstellen',
      intro: 'Hol Notizen aus einer Fieldnotes-Backup-Datei zurück.',
      choose: 'Fieldnotes-Backup auswählen',
      chooseTitle: 'Backup-Datei auswählen',
      hint: '.json · bis zu 10 MB',
      goodToKnow: 'Gut zu wissen',
      copies:
        'Notizen werden als neue Kopien hinzugefügt. Nichts Vorhandenes wird ersetzt.',
      duplicates:
        'Wenn du dasselbe Backup zweimal importierst, entstehen Duplikate.',
      limits: 'Bis zu 5.000 Notizen und 10 MB pro Datei.',
      imported:
        '{n} Notiz als neue Kopie importiert. Vorhandene Notizen wurden behalten. Gelöschte Notizen liegen im Papierkorb. | {n} Notizen als neue Kopien importiert. Vorhandene Notizen wurden behalten. Gelöschte Notizen liegen im Papierkorb.',
      failed:
        'Das Backup konnte nicht importiert werden. Bitte versuch es noch einmal.',
      tooLarge: 'Wähle ein Backup unter 10 MB.',
      unreadable:
        'Diese Datei ist kein lesbares JSON. Wähle ein Fieldnotes-Backup.',
      invalid:
        'Wähle ein gültiges Fieldnotes-Backup der Version 1 mit höchstens 5.000 Notizen.',
    },
  },
}

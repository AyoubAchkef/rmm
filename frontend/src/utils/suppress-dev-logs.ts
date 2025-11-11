/**
 * Supprime les logs de développement non désirés dans la console
 * Ce fichier doit être importé au démarrage de l'application
 */

if (typeof window !== 'undefined') {
  // Sauvegarde des méthodes console originales
  const originalWarn = console.warn.bind(console);
  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalError = console.error.bind(console);

  // Liste des patterns à supprimer (regex ou string)
  const suppressedPatterns = [
    /Duplicate extension names found/i,
    /\[tiptap warn\]/i,
    /Download the React DevTools/i,
    /\[HMR\] connected/i,
    /HMR.*connected/i,
    /react.dev\/link\/react-devtools/i,
    /overrideMethod/,
    /installHook\.js/,
    /forward-logs-shared\.ts/,
    /iframe.*allow-scripts.*allow-same-origin/i,
    /sandbox.*can escape its sandboxing/i,
    /about:srcdoc/i,
  ];

  // Fonction pour vérifier si un message doit être supprimé
  const shouldSuppress = (...args: any[]): boolean => {
    // Convertir tous les arguments en une seule chaîne pour la recherche
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Vérifier chaque pattern
    return suppressedPatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(message);
      }
      return message.includes(pattern);
    });
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    if (!shouldSuppress(...args)) {
      originalWarn(...args);
    }
  };

  // Override console.log
  console.log = (...args: any[]) => {
    if (!shouldSuppress(...args)) {
      originalLog(...args);
    }
  };

  // Override console.info
  console.info = (...args: any[]) => {
    if (!shouldSuppress(...args)) {
      originalInfo(...args);
    }
  };

  // Override console.error pour filtrer uniquement les warnings spécifiques
  console.error = (...args: any[]) => {
    if (!shouldSuppress(...args)) {
      originalError(...args);
    }
  };

  // Suppression des warnings TipTap au niveau de la bibliothèque
  if (typeof window !== 'undefined') {
    const originalConsoleWarn = window.console.warn;
    Object.defineProperty(window.console, 'warn', {
      configurable: true,
      enumerable: true,
      value: (...args: any[]) => {
        if (!shouldSuppress(...args)) {
          originalConsoleWarn.apply(window.console, args);
        }
      },
      writable: true,
    });
  }
}

export {};

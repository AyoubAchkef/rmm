export function SuppressLogsScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  if (typeof window === 'undefined') return;

  const originalWarn = console.warn.bind(console);
  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalError = console.error.bind(console);

  const suppressedPatterns = [
    /Duplicate extension names found/i,
    /\\[tiptap warn\\]/i,
    /Download the React DevTools/i,
    /\\[HMR\\] connected/i,
    /HMR.*connected/i,
    /react\\.dev\\/link\\/react-devtools/i,
    /overrideMethod/,
    /installHook\\.js/,
    /forward-logs-shared\\.ts/,
    /iframe.*allow-scripts.*allow-same-origin/i,
    /sandbox.*can escape its sandboxing/i,
    /about:srcdoc/i,
  ];

  const shouldSuppress = function() {
    const message = Array.from(arguments).map(function(arg) {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    return suppressedPatterns.some(function(pattern) {
      if (pattern instanceof RegExp) {
        return pattern.test(message);
      }
      return message.includes(pattern);
    });
  };

  console.warn = function() {
    if (!shouldSuppress.apply(null, arguments)) {
      originalWarn.apply(console, arguments);
    }
  };

  console.log = function() {
    if (!shouldSuppress.apply(null, arguments)) {
      originalLog.apply(console, arguments);
    }
  };

  console.info = function() {
    if (!shouldSuppress.apply(null, arguments)) {
      originalInfo.apply(console, arguments);
    }
  };

  console.error = function() {
    if (!shouldSuppress.apply(null, arguments)) {
      originalError.apply(console, arguments);
    }
  };
})();
        `,
      }}
    />
  );
}

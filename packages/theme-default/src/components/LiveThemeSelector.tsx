import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

export default function LiveThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const themes = [
    { id: 'default', name: 'Default', icon: '🎨', desc: 'Modern & Clean' },
    { id: 'blog', name: 'Blog', icon: '📝', desc: 'Article Focused' },
    { id: 'business', name: 'Business', icon: '💼', desc: 'Professional' },
    { id: 'minimal', name: 'Minimal', icon: '🎯', desc: 'Ultra Clean' }
  ];

  const handleThemeChange = (themeId: string) => {
    if (themeId === selectedTheme) return;

    setIsTransitioning(true);

    // Apply theme-specific styles
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${themeId}`);

    // Apply CSS custom properties based on theme
    const root = document.documentElement;

    if (themeId === 'blog') {
      root.style.setProperty('--font-family', 'Georgia, serif');
      root.style.setProperty('--font-size', '18px');
      root.style.setProperty('--line-height', '1.7');
    } else if (themeId === 'business') {
      root.style.setProperty('--font-family', 'Helvetica, Arial, sans-serif');
      root.style.setProperty('--font-size', '15px');
      root.style.setProperty('--line-height', '1.5');
    } else if (themeId === 'minimal') {
      root.style.setProperty('--font-family', '-apple-system, BlinkMacSystemFont, sans-serif');
      root.style.setProperty('--font-size', '16px');
      root.style.setProperty('--line-height', '1.6');
    } else {
      root.style.setProperty('--font-family', 'Inter, system-ui, sans-serif');
      root.style.setProperty('--font-size', '16px');
      root.style.setProperty('--line-height', '1.6');
    }

    setSelectedTheme(themeId);
    localStorage.setItem('leaf-live-theme', themeId);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('leaf-live-theme') || 'default';
    handleThemeChange(savedTheme);
  }, []);

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  return (
    <div className={`live-theme-selector ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Theme Selector Bar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                🎨 Choose Theme:
              </span>
              <div className="flex gap-2">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTheme === theme.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={`${theme.name}: ${theme.desc}`}
                  >
                    <span className="text-lg">{theme.icon}</span>
                    <span className="hidden sm:inline">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>Active:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {currentTheme.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content py-16"
        style={{
          transition: 'all 0.3s ease-in-out',
          opacity: isTransitioning ? 0.7 : 1
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit' }}
            >
              Leaf Theme Showcase
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              style={{
                fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit',
                fontSize: selectedTheme === 'blog' ? '20px' : '18px'
              }}
            >
              Experience the power of instant theme switching. Click the buttons above to see how Leaf
              transforms with different themes - from modern and clean to professional and minimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: selectedTheme === 'minimal' ? '0' : '1rem'
              }}
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4"
                style={{
                  borderRadius: selectedTheme === 'business' ? '0.25rem' : '0.5rem'
                }}
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2"
                style={{ fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit' }}
              >
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400"
                style={{
                  fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit',
                  fontSize: selectedTheme === 'blog' ? '16px' : '14px'
                }}
              >
                Built with Preact and Vite for optimal performance and instant loading.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: selectedTheme === 'minimal' ? '0' : '1rem'
              }}
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4"
                style={{
                  borderRadius: selectedTheme === 'business' ? '0.25rem' : '0.5rem'
                }}
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2"
                style={{ fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit' }}
              >
                Beautiful Themes
              </h3>
              <p className="text-gray-600 dark:text-gray-400"
                style={{
                  fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit',
                  fontSize: selectedTheme === 'blog' ? '16px' : '14px'
                }}
              >
                Choose from multiple professionally designed themes that work perfectly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: selectedTheme === 'minimal' ? '0' : '1rem'
              }}
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4"
                style={{
                  borderRadius: selectedTheme === 'business' ? '0.25rem' : '0.5rem'
                }}
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2"
                style={{ fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit' }}
              >
                Easy to Use
              </h3>
              <p className="text-gray-600 dark:text-gray-400"
                style={{
                  fontFamily: selectedTheme === 'blog' ? 'Georgia, serif' : 'inherit',
                  fontSize: selectedTheme === 'blog' ? '16px' : '14px'
                }}
              >
                Simple configuration with powerful features for documentation sites.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
              style={{
                borderRadius: selectedTheme === 'minimal' ? '0' : '0.75rem'
              }}
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current theme: <strong className="text-gray-900 dark:text-gray-100">{currentTheme.name}</strong>
              </span>
              <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white font-mono">
                {selectedTheme}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .live-theme-selector.transitioning .preview-content {
          opacity: 0.7;
          transform: scale(0.98);
        }

        .preview-content {
          transition: all 0.3s ease-in-out;
        }

        .theme-selector-bar {
          transition: all 0.2s ease;
        }

        .theme-business .prose {
          font-family: Helvetica, Arial, sans-serif;
        }

        .theme-blog .prose {
          font-family: Georgia, serif;
        }

        .theme-minimal * {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}


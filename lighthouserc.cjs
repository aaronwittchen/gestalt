module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 5,
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu --headless',
        throttling: {
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: '.*',
          aggregationMethod: 'median-run',
          assertions: {
            'categories:performance': ['error', { minScore: 0.8 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: '.*',
          aggregationMethod: 'median-run',
          assertions: {
            'categories:performance': ['warn', { minScore: 1 }],
            'categories:accessibility': ['warn', { minScore: 1 }],
            'categories:best-practices': ['warn', { minScore: 1 }],
            'categories:seo': ['warn', { minScore: 1 }],
          },
        },
      ],
    },
  },
}

define([], () => {
  // Common variations mapping
  const labelMap = {
    // Languages
    javascript: ['js', 'node.js', 'nodejs', 'node'],
    python: ['py', 'python3', 'python2'],
    csharp: ['c#', 'dotnet', '.net', 'net'],
    cpp: ['c++', 'cplusplus'],

    // Difficulty levels
    beginner: [
      'easy',
      'starter',
      'newbie',
      'first-timers-only',
      'good-first-issue',
    ],
    intermediate: ['medium', 'moderate'],
    advanced: ['hard', 'expert', 'difficult'],

    // Common categories
    documentation: ['docs', 'documents', 'wiki'],
    bug: ['bugfix', 'bug-fix', 'bugs'],
    enhancement: ['feature', 'improvement', 'new-feature'],
    web: ['website', 'webapp', 'web-app'],
  };

  function normalizeLabel(label) {
    label = label.toLowerCase().trim();

    // Check if this label should be normalized
    for (const [normalized, variations] of Object.entries(labelMap)) {
      if (variations.includes(label) || label === normalized) {
        return normalized;
      }
    }

    return label;
  }

  function normalizeLabels(labels) {
    return [...new Set(labels.map(normalizeLabel))];
  }

  return {
    normalizeLabel,
    normalizeLabels,
  };
});

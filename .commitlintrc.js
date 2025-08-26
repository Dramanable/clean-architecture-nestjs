/**
 * 📝 COMMITLINT CONFIGURATION - Semantic Commit Rules
 *
 * Configuration pour commitlint avec les règles conventional commits
 * Assure la cohérence des messages de commit dans le projet
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(.*):\s(.*)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    // Type de commit obligatoire
    'type-enum': [
      2,
      'always',
      [
        '🎉 feat', // Nouvelle fonctionnalité
        '🐛 fix', // Correction de bug
        '📚 docs', // Documentation
        '💄 style', // Changements qui n'affectent pas le sens du code
        '♻️ refactor', // Refactoring qui ne corrige pas de bug ni n'ajoute de fonctionnalité
        '⚡ perf', // Amélioration des performances
        '✅ test', // Ajout de tests manquants ou correction de tests existants
        '🔧 chore', // Changements aux outils de build ou dépendances auxiliaires
        '🚀 ci', // Changements aux fichiers et scripts de CI
        '⏪ revert', // Annulation d'un commit précédent
        '🔐 security', // Corrections de sécurité
        '🌐 i18n', // Internationalisation
        '♿ a11y', // Accessibilité
        '🚨 hotfix', // Correction critique en production
      ],
    ],
    // Longueur du sujet
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 10],
    // Cas du sujet
    'subject-case': [2, 'always', 'sentence-case'],
    // Format du corps
    'body-max-line-length': [2, 'always', 100],
    // Footer obligatoire pour certains types
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: 'Sélectionnez le type de changement que vous commitez',
        enum: {
          '🎉 feat': {
            description: '✨ Une nouvelle fonctionnalité',
            title: 'Features',
            emoji: '✨',
          },
          '🐛 fix': {
            description: '🐛 Une correction de bug',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          '📚 docs': {
            description: '📚 Documentation seulement',
            title: 'Documentation',
            emoji: '📚',
          },
          '💄 style': {
            description: "💄 Changements qui n'affectent pas le sens du code",
            title: 'Styles',
            emoji: '💄',
          },
          '♻️ refactor': {
            description:
              "♻️ Un changement de code qui ne corrige pas de bug ni n'ajoute de fonctionnalité",
            title: 'Code Refactoring',
            emoji: '♻️',
          },
          '⚡ perf': {
            description:
              '⚡ Un changement de code qui améliore les performances',
            title: 'Performance Improvements',
            emoji: '⚡',
          },
          '✅ test': {
            description:
              '✅ Ajout de tests manquants ou correction de tests existants',
            title: 'Tests',
            emoji: '✅',
          },
          '🔧 chore': {
            description:
              '🔧 Changements aux outils de build ou dépendances auxiliaires',
            title: 'Chores',
            emoji: '🔧',
          },
          '🚀 ci': {
            description: '🚀 Changements aux fichiers et scripts de CI',
            title: 'Continuous Integrations',
            emoji: '🚀',
          },
          '⏪ revert': {
            description: "⏪ Annulation d'un commit précédent",
            title: 'Reverts',
            emoji: '⏪',
          },
        },
      },
      scope: {
        description: 'Quel est le scope de ce changement (ex: component, page)',
      },
      subject: {
        description:
          'Écrivez une description courte et impérative du changement',
      },
      body: {
        description: 'Fournissez une description plus détaillée du changement',
      },
      isBreaking: {
        description: 'Y a-t-il des changements breaking?',
      },
      breakingBody: {
        description:
          'Un commit BREAKING CHANGE requiert un corps. Veuillez entrer une description plus longue du commit lui-même',
      },
      breaking: {
        description: 'Décrivez les changements breaking',
      },
      isIssueAffected: {
        description: 'Ce changement affecte-t-il des issues ouvertes?',
      },
      issuesBody: {
        description:
          'Si les issues sont fermées, le commit requiert un corps. Veuillez entrer une description plus longue du commit lui-même',
      },
      issues: {
        description:
          'Ajoutez les références d\'issues (ex: "fix #123", "re #123")',
      },
    },
  },
};

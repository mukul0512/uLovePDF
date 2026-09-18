import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * Recto's layering rules, enforced by the linter.
 *
 * The PDF engines are heavy, browser-only and replaceable. Keeping them behind
 * `lib/pdf/engine` means swapping `pdf-lib` for a maintained fork is a one-file
 * change instead of a refactor -- but only if nothing else imports them.
 */
const PDF_ENGINE_MESSAGE =
  'Import PDF engines only inside lib/pdf/engine. Elsewhere, use the adapters exported from @/lib/pdf.';

const FRAMEWORK_FREE_MESSAGE =
  'lib/ and utils/ must stay framework-agnostic so they can run inside Web Workers. Move React-aware code into hooks/ or components/.';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Debug output goes through @/utils/commonFunctions/logger, which strips
      // itself from production builds. Raw console calls would ship to users.
      'no-console': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // UI and routing layers talk to our own adapters, never to the engines.
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'pdfjs-dist', message: PDF_ENGINE_MESSAGE },
            { name: 'pdf-lib', message: PDF_ENGINE_MESSAGE },
          ],
          patterns: [
            {
              group: ['pdfjs-dist/*', 'pdf-lib/*', '@/lib/pdf/engine/*'],
              message: PDF_ENGINE_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  // Domain logic must be importable from a worker, where React and Next do not exist.
  {
    files: ['lib/**/*.ts', 'utils/**/*.ts', 'constants/**/*.ts', 'types/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: FRAMEWORK_FREE_MESSAGE },
            { name: 'react-dom', message: FRAMEWORK_FREE_MESSAGE },
          ],
          patterns: [
            {
              group: ['next/*', '@/components/*', '@/hooks/*', '@/app/*'],
              message: FRAMEWORK_FREE_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  // The logger is the one place allowed to reach for the console.
  {
    files: ['utils/commonFunctions/logger.ts'],
    rules: { 'no-console': 'off' },
  },

  // Build scripts report progress to the terminal; that is their job.
  {
    files: ['scripts/**/*.{js,mjs,cjs,ts}'],
    rules: { 'no-console': 'off' },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Copied from pdfjs-dist at build time; not ours to lint.
    'public/pdfjs/**',
  ]),

  // Must stay last: switches off stylistic rules that would fight Prettier.
  prettier,
]);

export default eslintConfig;

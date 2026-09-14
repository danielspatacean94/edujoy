module.exports = {
  rootDir: '..',
  roots: ['<rootDir>/ui/src'],
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/ui/tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/ui/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
}

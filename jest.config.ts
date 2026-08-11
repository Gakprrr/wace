// @ts-nocheck
import type { Config } from 'jest';

const config: Config = {
  projects: [
    // --- Tests Backend (Node / API routes) ---
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/api/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: { module: 'commonjs', esModuleInterop: true },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    // --- Tests Frontend (jsdom / React) ---
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/__tests__/frontend/**/*.test.tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: { module: 'commonjs', esModuleInterop: true, jsx: 'react-jsx' },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/fileMock.ts',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    // --- Tests Unitaires Services ---
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: { module: 'commonjs', esModuleInterop: true },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
};

export default config;

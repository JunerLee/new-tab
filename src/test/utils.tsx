import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock react-i18next
export const mockUseTranslation = () => ({
  t: (key: string) => key,
  i18n: {
    changeLanguage: vi.fn(),
    language: 'en',
  },
})

vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const createMockQuickLaunchItem = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Item',
  url: 'https://test.com',
  icon: 'test-icon',
  favicon: 'test-favicon',
  category: 'test',
  order: 1,
  isCustom: true,
  ...overrides,
})

export const createMockSearchEngine = (overrides = {}) => ({
  id: 'test-engine',
  name: 'Test Engine',
  url: 'https://test.com/search?q={searchTerms}',
  icon: 'test-icon',
  placeholder: 'Search test...',
  favicon: 'test-favicon',
  ...overrides,
})

export const createMockBingImage = (overrides = {}) => ({
  url: 'https://test.com/image.jpg',
  title: 'Test Image',
  copyright: 'Test Copyright',
  date: '2024-01-01',
  downloadUrl: 'https://test.com/download.jpg',
  ...overrides,
})

export const createMockWeatherData = (overrides = {}) => ({
  location: 'Test City',
  temperature: 20,
  condition: 'Sunny',
  icon: 'sun',
  humidity: 50,
  windSpeed: 10,
  lastUpdated: Date.now(),
  ...overrides,
})
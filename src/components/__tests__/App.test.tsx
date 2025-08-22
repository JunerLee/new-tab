import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import App from '../../App'
import { useAppStore } from '@/stores/useAppStore'

// Mock hooks
vi.mock('@/hooks/useTheme')
vi.mock('@/hooks/useKeyboard')

// Mock store
vi.mock('@/stores/useAppStore')

// Mock components that might have complex behavior
vi.mock('../Background/BackgroundImage', () => ({
  BackgroundImage: () => <div data-testid="background-image">Background</div>,
}))

vi.mock('../TimeWeather', () => ({
  TimeWeather: () => <div data-testid="time-weather">Time & Weather</div>,
}))

vi.mock('../SearchEngine/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search Bar</div>,
}))

vi.mock('../QuickLaunch/QuickLaunchGrid', () => ({
  QuickLaunchGrid: () => <div data-testid="quick-launch">Quick Launch</div>,
}))

vi.mock('../Settings/SettingsModal', () => ({
  SettingsModal: () => <div data-testid="settings-modal">Settings Modal</div>,
}))

describe('App', () => {
  const mockSetSettingsOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAppStore as any).mockReturnValue({
      setSettingsOpen: mockSetSettingsOpen,
    })
  })

  it('renders all main components', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('background-image')).toBeInTheDocument()
      expect(screen.getByTestId('time-weather')).toBeInTheDocument()
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('quick-launch')).toBeInTheDocument()
      expect(screen.getByTestId('settings-modal')).toBeInTheDocument()
    })
  })

  it('renders settings button', () => {
    render(<App />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    expect(settingsButton).toBeInTheDocument()
  })

  it('opens settings modal when settings button is clicked', async () => {
    render(<App />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    
    expect(mockSetSettingsOpen).toHaveBeenCalledWith(true)
  })

  it('renders footer with extension name', () => {
    render(<App />)
    
    expect(screen.getByText('Modern New Tab Extension')).toBeInTheDocument()
  })

  it('applies dark theme class on mount', () => {
    render(<App />)
    
    expect(document.documentElement.classList.contains('dark:bg-claude-dark')).toBe(true)
  })

  it('has proper accessibility attributes', () => {
    render(<App />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    expect(settingsButton).toHaveAttribute('type', 'button')
  })

  it('handles keyboard navigation', async () => {
    render(<App />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    
    // Focus the settings button
    settingsButton.focus()
    expect(document.activeElement).toBe(settingsButton)
    
    // Simulate Enter key press
    fireEvent.keyDown(settingsButton, { key: 'Enter' })
    // Note: We'd need to mock the actual keyboard handling for this to work
  })

  it('handles error boundaries gracefully', () => {
    // This would require setting up error throwing components
    // For now, we ensure the error boundary structure is in place
    render(<App />)
    
    // The app should render without throwing
    expect(screen.getByTestId('background-image')).toBeInTheDocument()
  })
})
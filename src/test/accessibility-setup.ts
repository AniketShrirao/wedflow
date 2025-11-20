import { configureAxe } from 'axe-core'

// Configure axe-core for accessibility testing
configureAxe({
    rules: [
        {
            id: 'color-contrast',
            enabled: true
        },
        {
            id: 'keyboard-navigation',
            enabled: true
        },
        {
            id: 'focus-management',
            enabled: true
        },
        {
            id: 'aria-labels',
            enabled: true
        },
        {
            id: 'semantic-markup',
            enabled: true
        }
    ],
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
})

// Mock screen reader announcements
global.mockScreenReaderAnnouncements = []

// Mock ARIA live regions
const mockAriaLiveRegion = {
    announce: (message: string) => {
        global.mockScreenReaderAnnouncements.push(message)
    },
    clear: () => {
        global.mockScreenReaderAnnouncements = []
    }
}

// Make it available globally for tests
global.mockAriaLiveRegion = mockAriaLiveRegion

// Reset announcements before each test
beforeEach(() => {
    global.mockScreenReaderAnnouncements = []
})
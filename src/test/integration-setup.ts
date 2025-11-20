import { vi } from 'vitest'

// Mock Supabase client for integration tests
const mockSupabaseClient = {
    from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: vi.fn().mockResolvedValue({ data: [], error: null })
    })),
    auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null })
    },
    storage: {
        from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({ data: null, error: null }),
            download: vi.fn().mockResolvedValue({ data: null, error: null }),
            remove: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
    }
}

// Mock Sanity client for integration tests
const mockSanityClient = {
    fetch: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    patch: vi.fn(() => ({
        set: vi.fn().mockReturnThis(),
        commit: vi.fn().mockResolvedValue({})
    })),
    delete: vi.fn().mockResolvedValue({})
}

// Make mocks available globally
global.mockSupabaseClient = mockSupabaseClient
global.mockSanityClient = mockSanityClient

// Mock external services
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => mockSupabaseClient
}))

vi.mock('@sanity/client', () => ({
    default: () => mockSanityClient
}))

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})
import { describe, it, expect } from 'vitest'
import { validatePublicWeddingData, PublicWeddingDataSchema } from '../validator'
import { sanitizeUserInput } from '../sanitization'

describe('Data Validation System', () => {
    it('should validate complete wedding data', () => {
        const validData = {
            couple: {
                partner1_name: 'John Doe',
                partner2_name: 'Jane Smith',
                wedding_date: '2024-06-15',
                couple_slug: 'john-jane-2024'
            },
            events: {
                couple_intro: 'We are excited to share our special day with you!',
                events: [
                    {
                        id: '1',
                        name: 'Wedding Ceremony',
                        date: '2024-06-15',
                        time: '14:00',
                        description: 'Join us for our wedding ceremony',
                        couple_id: '123'
                    }
                ],
                venues: [],
                timeline: []
            },
            photos: {
                categories: ['ceremony', 'reception'],
                highlight_photos: []
            },
            gifts: {
                upi_id: 'john@paytm',
                qr_code_url: 'https://example.com/qr.png',
                custom_message: 'Your blessings are the greatest gift'
            }
        }

        const result = validatePublicWeddingData(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should handle missing required fields', () => {
        const invalidData = {
            couple: {
                partner1_name: '',
                partner2_name: 'Jane Smith',
                wedding_date: '2024-06-15',
                couple_slug: 'john-jane-2024'
            },
            events: {
                couple_intro: '',
                events: [],
                venues: [],
                timeline: []
            },
            photos: null,
            gifts: null
        }

        const result = validatePublicWeddingData(invalidData)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should sanitize user input', () => {
        const dirtyInput = '<script>alert("xss")</script>Hello <b>World</b>!'
        const sanitized = sanitizeUserInput(dirtyInput, 'basic')

        expect(sanitized).not.toContain('<script>')
        expect(sanitized).toContain('<b>World</b>')
    })

    it('should generate data quality warnings', () => {
        const incompleteData = {
            couple: {
                partner1_name: 'John',
                partner2_name: 'Jane',
                wedding_date: null,
                couple_slug: 'john-jane'
            },
            events: {
                couple_intro: 'Short intro',
                events: [],
                venues: [],
                timeline: []
            },
            photos: null,
            gifts: null
        }

        const result = validatePublicWeddingData(incompleteData)
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings.some(w => w.field === 'couple.wedding_date')).toBe(true)
    })
})
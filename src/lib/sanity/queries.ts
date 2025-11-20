import { groq } from 'next-sanity'

export const weddingTemplatesQuery = groq`
  *[_type == "weddingTemplate" && isActive == true] | order(name asc) {
    _id,
    name,
    description,
    preview,
    colorScheme,
    fonts,
    layout,
    isActive
  }
`

export const todoTemplatesQuery = groq`
  *[_type == "todoTemplate" && isActive == true] | order(order asc, category asc) {
    _id,
    title,
    description,
    category,
    timeframe,
    priority,
    estimatedDuration,
    tips,
    order
  }
`

export const vendorCategoriesQuery = groq`
  *[_type == "vendorCategory" && isActive == true] | order(order asc, name asc) {
    _id,
    name,
    slug,
    description,
    icon,
    commonServices,
    averageCost,
    bookingTimeframe,
    questionsToAsk,
    order
  }
`
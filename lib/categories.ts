/**
 * Centralized category configuration for CivicTrack
 * Ensures consistency across all components
 */

export interface Category {
  value: string
  label: string
  description: string
  keywords: string[]
  icon?: string
}

/**
 * Official CivicTrack issue categories
 * Based on common civic infrastructure needs
 */
export const CIVIC_CATEGORIES: Category[] = [
  {
    value: "roads",
    label: "Roads (potholes, obstructions)",
    description: "Issues related to road infrastructure including potholes, cracks, and blocked roads",
    keywords: ["road", "pothole", "street", "pavement", "asphalt", "crack", "highway", "intersection"],
    icon: "🛣️"
  },
  {
    value: "lighting", 
    label: "Lighting (broken or flickering lights)",
    description: "Problems with street lights, traffic lights, and public lighting systems",
    keywords: ["light", "lamp", "dark", "flickering", "streetlight", "bulb", "illumination", "brightness"],
    icon: "💡"
  },
  {
    value: "water",
    label: "Water Supply (leaks, low pressure)", 
    description: "Water infrastructure issues including leaks, pressure problems, and supply disruptions",
    keywords: ["water", "leak", "pipe", "pressure", "supply", "tap", "faucet", "hydrant", "burst", "flow"],
    icon: "💧"
  },
  {
    value: "cleanliness",
    label: "Cleanliness (overflowing bins, garbage)",
    description: "Sanitation and cleanliness issues including waste management and public hygiene",
    keywords: ["garbage", "trash", "waste", "bin", "overflowing", "dirty", "clean", "litter", "dump", "sanitation"],
    icon: "🗑️"
  },
  {
    value: "safety",
    label: "Public Safety (open manholes, exposed wiring)",
    description: "Public safety hazards including exposed utilities and dangerous conditions",
    keywords: ["danger", "unsafe", "hazard", "manhole", "exposed", "wiring", "electric", "open", "hole", "risk"],
    icon: "⚠️"
  },
  {
    value: "obstructions",
    label: "Obstructions (fallen trees, debris)",
    description: "Physical obstructions blocking public areas including fallen trees and debris",
    keywords: ["tree", "fallen", "debris", "blocked", "branch", "obstacle", "blocking", "obstruction", "path", "sidewalk"],
    icon: "🌳"
  }
]

/**
 * Get categories for form dropdowns (excludes "all" option)
 */
export const getFormCategories = (): Category[] => {
  return CIVIC_CATEGORIES
}

/**
 * Get categories for filtering (includes "all" option)
 */
export const getFilterCategories = (): Array<Category & { value: string }> => {
  return [
    {
      value: "all",
      label: "All Categories",
      description: "Show issues from all categories",
      keywords: [],
      icon: "📋"
    },
    ...CIVIC_CATEGORIES
  ]
}

/**
 * Auto-categorize based on description text
 * Returns the most likely category value or null
 */
export const suggestCategory = (description: string): string | null => {
  if (!description || description.length < 10) return null
  
  const text = description.toLowerCase()
  const scores: Record<string, number> = {}
  
  // Score each category based on keyword matches
  CIVIC_CATEGORIES.forEach(category => {
    scores[category.value] = 0
    category.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        scores[category.value] += 1
      }
    })
  })
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return null
  
  const bestCategory = Object.keys(scores).find(key => scores[key] === maxScore)
  return bestCategory || null
}

/**
 * Get category by value
 */
export const getCategoryByValue = (value: string): Category | undefined => {
  return CIVIC_CATEGORIES.find(cat => cat.value === value)
}

/**
 * Get category display name with icon
 */
export const getCategoryDisplayName = (value: string): string => {
  const category = getCategoryByValue(value)
  return category ? `${category.icon} ${category.label}` : value
}

/**
 * Validate if category exists
 */
export const isValidCategory = (value: string): boolean => {
  return CIVIC_CATEGORIES.some(cat => cat.value === value)
}

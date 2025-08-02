/**
 * Utility functions for date formatting that ensure consistent 
 * server-side and client-side rendering
 */

/**
 * Format date consistently for SSR/CSR compatibility
 * Always returns format: DD/MM/YYYY
 */
export function formatDateConsistent(dateString: string | Date): string {
  const date = new Date(dateString)
  
  // Ensure consistent formatting across server and client
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Format date with time consistently
 * Always returns format: DD/MM/YYYY HH:MM
 */
export function formatDateTimeConsistent(dateString: string | Date): string {
  const date = new Date(dateString)
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Format relative time (e.g., "2 hours ago")
 * Client-only to avoid hydration issues
 */
export function formatRelativeTime(dateString: string | Date): string {
  if (typeof window === 'undefined') {
    // Return absolute date on server to avoid hydration mismatch
    return formatDateConsistent(dateString)
  }
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return formatDateConsistent(dateString)
}

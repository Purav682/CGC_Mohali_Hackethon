/**
 * Authentication utilities and types for CivicTrack
 */

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  isVerified: boolean
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  preferences?: {
    notifications: boolean
    newsletter: boolean
    darkMode: boolean
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock user database (in production, this would be a real database)
const mockUsers: User[] = [
  {
    id: "user_123",
    email: "john@example.com",
    name: "John Doe",
    role: "user",
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
    preferences: {
      notifications: true,
      newsletter: false,
      darkMode: false
    }
  },
  {
    id: "admin_456",
    email: "admin@civictrack.com",
    name: "Admin User",
    role: "admin",
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-16T09:15:00Z",
    preferences: {
      notifications: true,
      newsletter: true,
      darkMode: true
    }
  }
]

// Verification codes storage (in production, this would be in Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: Date; userId?: string }>()

// Password reset tokens (in production, this would be in Redis or database)
const resetTokens = new Map<string, { email: string; expiresAt: Date }>()

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = "AuthError"
  }
}

/**
 * Generate a random verification code
 */
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Generate a secure token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Simulate email sending (in production, use a real email service)
 */
async function sendEmail(to: string, subject: string, content: string): Promise<void> {
  console.log(`📧 Email sent to ${to}:`)
  console.log(`Subject: ${subject}`)
  console.log(`Content: ${content}`)
  console.log("---")
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * Register a new user
 */
export async function registerUser(email: string, name: string, password: string, role: "user" | "admin" = "user"): Promise<{ success: boolean; message: string; needsVerification?: boolean }> {
  try {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      throw new AuthError("User with this email already exists", "USER_EXISTS")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AuthError("Invalid email format", "INVALID_EMAIL")
    }

    // Validate password strength
    if (password.length < 8) {
      throw new AuthError("Password must be at least 8 characters long", "WEAK_PASSWORD")
    }

    // For admin registration, require specific domain or approval
    if (role === "admin" && !email.endsWith("@civictrack.com")) {
      throw new AuthError("Admin accounts require approval. Please contact support.", "ADMIN_APPROVAL_REQUIRED")
    }

    // Create new user
    const newUser: User = {
      id: `${role}_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role,
      isVerified: false,
      createdAt: new Date().toISOString(),
      preferences: {
        notifications: true,
        newsletter: false,
        darkMode: false
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    verificationCodes.set(email.toLowerCase(), {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      userId: newUser.id
    })

    // Send verification email
    await sendEmail(
      email,
      "Verify your CivicTrack account",
      `Welcome to CivicTrack! Your verification code is: ${verificationCode}\n\nThis code expires in 15 minutes.\n\nIf you didn't create this account, please ignore this email.`
    )

    // Add user to mock database (unverified)
    mockUsers.push(newUser)

    return {
      success: true,
      message: `Registration successful! Please check your email for verification code.`,
      needsVerification: true
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Registration failed. Please try again." }
  }
}

/**
 * Verify email with code
 */
export async function verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const verification = verificationCodes.get(email.toLowerCase())
    if (!verification) {
      throw new AuthError("Invalid or expired verification code", "INVALID_CODE")
    }

    if (verification.expiresAt < new Date()) {
      verificationCodes.delete(email.toLowerCase())
      throw new AuthError("Verification code has expired", "EXPIRED_CODE")
    }

    if (verification.code !== code.toUpperCase()) {
      throw new AuthError("Invalid verification code", "INVALID_CODE")
    }

    // Find and verify user
    const user = mockUsers.find(u => u.id === verification.userId)
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND")
    }

    user.isVerified = true
    user.lastLoginAt = new Date().toISOString()
    verificationCodes.delete(email.toLowerCase())

    return {
      success: true,
      message: "Email verified successfully!",
      user
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Verification failed. Please try again." }
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND")
    }

    if (user.isVerified) {
      throw new AuthError("User is already verified", "ALREADY_VERIFIED")
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    verificationCodes.set(email.toLowerCase(), {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      userId: user.id
    })

    // Send verification email
    await sendEmail(
      email,
      "CivicTrack - New verification code",
      `Your new verification code is: ${verificationCode}\n\nThis code expires in 15 minutes.`
    )

    return {
      success: true,
      message: "New verification code sent to your email!"
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Failed to resend verification code. Please try again." }
  }
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User; needsVerification?: boolean }> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS")
    }

    // In production, verify password hash
    if (password.length < 8) {
      throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS")
    }

    if (!user.isVerified) {
      // Resend verification code
      await resendVerificationCode(email)
      return {
        success: false,
        message: "Please verify your email first. We've sent a new verification code.",
        needsVerification: true
      }
    }

    user.lastLoginAt = new Date().toISOString()

    return {
      success: true,
      message: "Login successful!",
      user
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Login failed. Please try again." }
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: "If an account with this email exists, you will receive password reset instructions."
      }
    }

    const resetToken = generateToken()
    resetTokens.set(resetToken, {
      email: user.email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    })

    await sendEmail(
      user.email,
      "Reset your CivicTrack password",
      `Click the link below to reset your password:\n\nhttp://localhost:3004/auth/reset-password?token=${resetToken}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    )

    return {
      success: true,
      message: "If an account with this email exists, you will receive password reset instructions."
    }
  } catch (error) {
    return { success: false, message: "Failed to send password reset email. Please try again." }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const resetData = resetTokens.get(token)
    if (!resetData) {
      throw new AuthError("Invalid or expired reset token", "INVALID_TOKEN")
    }

    if (resetData.expiresAt < new Date()) {
      resetTokens.delete(token)
      throw new AuthError("Reset token has expired", "EXPIRED_TOKEN")
    }

    if (newPassword.length < 8) {
      throw new AuthError("Password must be at least 8 characters long", "WEAK_PASSWORD")
    }

    const user = mockUsers.find(u => u.email === resetData.email)
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND")
    }

    // In production, hash the new password
    resetTokens.delete(token)

    return {
      success: true,
      message: "Password reset successfully! You can now login with your new password."
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Password reset failed. Please try again." }
  }
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | null {
  return mockUsers.find(u => u.id === id) || null
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'preferences'>>): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new AuthError("User not found", "USER_NOT_FOUND")
    }

    if (updates.name) {
      user.name = updates.name
    }

    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences }
    }

    return {
      success: true,
      message: "Profile updated successfully!",
      user
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: "Failed to update profile. Please try again." }
  }
}

/**
 * Logout user (client-side operation)
 */
export function logoutUser(): void {
  // In production, invalidate JWT tokens, clear cookies, etc.
  console.log("User logged out")
}

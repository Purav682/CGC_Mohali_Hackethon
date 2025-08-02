import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string  // Computed from profile firstName + lastName
  role: "CITIZEN" | "WORKER" | "OFFICIAL" | "ADMIN"
  isVerified: boolean
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
}

export interface LoginResult {
  success: boolean
  user?: User
  message: string
  needsVerification?: boolean
}

export interface RegisterResult {
  success: boolean
  user?: User
  message: string
  needsVerification?: boolean
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    })

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password"
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid email or password"
      }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in",
        needsVerification: true
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Return user data
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0],
      role: user.role,
      isVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        address: user.profile.address,
        city: user.profile.city,
        state: user.profile.state,
        zipCode: user.profile.zipCode
      } : undefined
    }

    return {
      success: true,
      user: userData,
      message: "Login successful"
    }

  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      message: "An error occurred during login"
    }
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address"
      }
    }

    // Check if email is a Gmail address (as requested)
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return {
        success: false,
        message: "Please use a valid Gmail address for registration"
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists"
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "CITIZEN", // Default role for new registrations
        emailVerified: false, // Require email verification
        profile: {
          create: {
            firstName,
            lastName,
            emailNotifications: true,
            pushNotifications: true
          }
        }
      },
      include: {
        profile: true
      }
    })

    // In a real application, you would send a verification email here
    // For demo purposes, we'll auto-verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    })

    const userData: User = {
      id: user.id,
      email: user.email,
      name: `${firstName} ${lastName}`,
      role: user.role,
      isVerified: true, // Auto-verified for demo
      createdAt: user.createdAt.toISOString(),
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        phone: user.profile?.phone,
        address: user.profile?.address,
        city: user.profile?.city,
        state: user.profile?.state,
        zipCode: user.profile?.zipCode
      }
    }

    return {
      success: true,
      user: userData,
      message: "Account created successfully! You can now log in."
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: "An error occurred during registration"
    }
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email.split('@')[0],
      role: user.role,
      isVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        address: user.profile.address,
        city: user.profile.city,
        state: user.profile.state,
        zipCode: user.profile.zipCode
      } : undefined
    }

  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * Verify email with code
 */
export async function verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    // For demo purposes, accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Please enter a valid 6-digit verification code"
      }
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        success: false,
        message: "User not found"
      }
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: "Email is already verified"
      }
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    })

    return {
      success: true,
      message: "Email verified successfully! You can now log in."
    }

  } catch (error) {
    console.error('Email verification error:', error)
    return {
      success: false,
      message: "An error occurred during verification"
    }
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        success: false,
        message: "User not found"
      }
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "Email is already verified"
      }
    }

    // In a real application, you would send a new verification email here
    // For demo purposes, we'll just return success
    return {
      success: true,
      message: "Verification code sent! Please check your email."
    }

  } catch (error) {
    console.error('Resend verification error:', error)
    return {
      success: false,
      message: "An error occurred while sending verification code"
    }
  }
}

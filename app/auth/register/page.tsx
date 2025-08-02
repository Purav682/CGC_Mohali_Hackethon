import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Since we're using Google OAuth, redirect register attempts to login
  redirect('/auth/login')
}

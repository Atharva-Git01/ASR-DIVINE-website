import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { adminDb } from '@/lib/supabase/admin'

export const authOptions: NextAuthOptions = {
  // No adapter — we use JWT sessions only. User profiles are managed
  // via the handle_new_user trigger in Supabase (migration 001).
  // Removing SupabaseAdapter eliminates the dual-session-store problem
  // where NextAuth and Supabase Auth maintained separate session tables.

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Use the service-role singleton for the auth check
        const supabase = adminDb()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data.user) return null

        // Fetch admin flag from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        return {
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.full_name ?? null,
          image: data.user.user_metadata?.avatar_url ?? null,
          isAdmin: profile?.is_admin ?? false,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin ?? false
      }
      // On Google sign-in, look up admin flag
      if (account?.provider === 'google' && token.id) {
        try {
          const { data: profile } = await adminDb()
            .from('profiles')
            .select('is_admin')
            .eq('id', token.id)
            .single()
          token.isAdmin = profile?.is_admin ?? false
        } catch {
          token.isAdmin = false
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.isAdmin = token.isAdmin
      return session
    },
  },
}

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from '@/lib/firebase2';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token || '';
      }
      if (user) {
        token.user = user;
        // Store user and tokens in Firestore
        await db.collection('users').doc(user.email as string).set({
          name: user.name,
          email: user.email,
          image: user.image,
          accessToken: account?.access_token || '',
        }, { merge: true });
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = token.user as typeof session.user;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

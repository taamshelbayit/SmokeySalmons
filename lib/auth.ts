import { type NextAuthOptions, getServerSession } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { EMAIL_FROM, RESEND_API_KEY } from '@/lib/config';
import nodemailer from 'nodemailer';

async function sendVerificationRequest({ identifier, url }: { identifier: string; url: string }) {
  if (RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({ from: EMAIL_FROM, to: identifier, subject: 'Sign in to Smokey Salmons', text: `Sign in: ${url}` });
    return;
  }
  const transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
  const info = await transporter.sendMail({ from: EMAIL_FROM, to: identifier, subject: 'Sign in to Smokey Salmons', text: `Sign in: ${url}` });
  console.log('Login email (dev):\n', info.message?.toString());
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      sendVerificationRequest,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email || token.email;
      if (email) {
        const admin = await prisma.adminUser.findUnique({ where: { email } }).catch(() => null);
        (token as any).isAdmin = !!admin;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).isAdmin = (token as any).isAdmin ?? false;
      return session;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

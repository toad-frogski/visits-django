import { TokenApi, TokenObtainPair } from "@/lib/api";
import { jwtVerify } from "jose";
import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const api = new TokenApi();
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await api.tokenCreate({
            username: credentials?.username,
            password: credentials?.password,
          } as unknown as TokenObtainPair)

          const { payload } = await jwtVerify(data.access, secret)

          return {
            id: payload.user_id,
            accessToken: data.access,
            refreshToken: data.refresh
          }
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };

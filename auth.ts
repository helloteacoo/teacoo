import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 這裡實作您的驗證邏輯
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
};

export const { auth } = NextAuth(authConfig); 
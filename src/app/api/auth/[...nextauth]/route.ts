import { sql } from '@vercel/postgres';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            // Store the user in the database when they first sign in
            if (account && profile) {
                const existingUser = await sql`
          SELECT * FROM users WHERE email = ${token.email}
        `;

                if (existingUser.rowCount === 0) {
                    // Create a new user
                    await sql`
            INSERT INTO users (id, email, display_name)
            VALUES (${token.sub}, ${token.email}, ${token.name})
          `;
                }
            }

            // Get the latest user data including gameplay_id
            const user = await sql`
        SELECT * FROM users WHERE id = ${token.sub}
      `;

            if (user.rowCount > 0) {
                token.gameplay_id = user.rows[0].gameplay_id;
                token.display_name = user.rows[0].display_name;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.gameplay_id = token.gameplay_id as string;
                session.user.display_name = token.display_name as string;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST }; 
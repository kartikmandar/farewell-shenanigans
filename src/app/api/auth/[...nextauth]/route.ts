import { sql } from '@vercel/postgres';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const runtime = 'nodejs';

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
            try {
                // Store the user in the database when they first sign in
                if (account && profile) {
                    try {
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
                    } catch (error) {
                        console.error('Error creating user:', error);
                        // Continue with authentication even if database operations fail
                    }
                }

                // Get the latest user data including gameplay_id
                try {
                    const user = await sql`
                        SELECT * FROM users WHERE id = ${token.sub}
                    `;

                    if (user && user.rowCount && user.rowCount > 0) {
                        token.gameplay_id = user.rows[0].gameplay_id;
                        token.display_name = user.rows[0].display_name;
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Set default values if database access fails
                    if (!token.gameplay_id) token.gameplay_id = '';
                    if (!token.display_name) token.display_name = token.name || '';
                }
            } catch (error) {
                console.error('Error in jwt callback:', error);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.gameplay_id = (token.gameplay_id as string) || '';
                session.user.display_name = (token.display_name as string) || session.user.name || '';
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST }; 
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            gameplay_id?: string | null;
            display_name?: string | null;
        };
    }

    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        gameplay_id?: string | null;
        display_name?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        sub: string;
        gameplay_id?: string;
        display_name?: string;
    }
} 
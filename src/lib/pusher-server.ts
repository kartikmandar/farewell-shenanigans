import Pusher from 'pusher';

// Initialize Pusher server
let pusherServer: Pusher | null = null;

export const getPusherServer = (): Pusher => {
    if (!pusherServer) {
        pusherServer = new Pusher({
            appId: process.env.PUSHER_APP_ID || '',
            key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
            secret: process.env.PUSHER_APP_SECRET || '',
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
            useTLS: true,
        });
    }
    return pusherServer;
}; 
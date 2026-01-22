import './globals.css'
import { ToastProvider } from '@/components/Toast'

export const metadata = {
    title: 'English Colony UOS - Video Contest',
    description: 'English Club is a place for language learners to use English in a casual setting. Vote for the best promo video in our Maverick চড়ুইভাতি contest!',
    keywords: 'english colony, uos, video contest, maverick, চড়ুইভাতি, english club, college, vote',
    openGraph: {
        title: 'English Colony UOS - Video Contest',
        description: 'Vote for the best promo video in our Maverick চড়ুইভাতি contest!',
        type: 'website',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <link rel="icon" href="/logo.png" />
            </head>
            <body className="antialiased">
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}

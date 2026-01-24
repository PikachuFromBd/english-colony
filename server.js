const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initBot } = require('./src/lib/bot') // Import Bot

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0' // Use 0.0.0.0 for production hosting
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    // Start the Telegram Bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
        try {
            initBot();
        } catch (e) {
            console.error('Failed to start Telegram Bot:', e);
        }
    }

    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 
                error: 'Internal server error',
                message: dev ? err.message : 'Something went wrong'
            }))
        }
    })
        .once('error', (err) => {
            console.error('Server error:', err)
            process.exit(1)
        })
        .listen(port, hostname, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
}).catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})

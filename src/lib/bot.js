const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID; // Strict security

let bot = null;

function initBot() {
    if (!token) {
        console.log('TELEGRAM_BOT_TOKEN not set. Bot skipped.');
        return;
    }

    // Polling mode is easiest for this setup
    bot = new TelegramBot(token, { polling: true });

    console.log('Telegram Bot started...');

    // Handle Messages
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const senderId = String(msg.from.id);

        // Security Check: Only allow Admin
        if (adminId && senderId !== String(adminId)) {
            bot.sendMessage(chatId, '⛔ Unauthorized access.');
            return;
        }

        // Handle Video Uploads
        if (msg.video || msg.document) {
            const fileId = msg.video ? msg.video.file_id : msg.document.file_id;
            const fileName = msg.video ? (msg.video.file_name || `video_${Date.now()}.mp4`) : msg.document.file_name;

            // Telegram limitation check (approx 20MB for Bot API)
            const fileSize = msg.video ? msg.video.file_size : msg.document.file_size;
            if (fileSize > 20 * 1024 * 1024) {
                bot.sendMessage(chatId, '⚠️ File too large! Telegram Bots can only download files under 20MB. Please use FTP for larger files.');
                return;
            }

            bot.sendMessage(chatId, '⬇️ Downloading video...');

            try {
                // Get file link
                const fileLink = await bot.getFileLink(fileId);

                // Prepare download path
                const downloadDir = path.join(process.cwd(), 'public', 'videos');
                if (!fs.existsSync(downloadDir)) {
                    fs.mkdirSync(downloadDir, { recursive: true });
                }

                // Sanitize filename
                const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = path.join(downloadDir, safeName);

                // Download file
                const file = fs.createWriteStream(filePath);
                https.get(fileLink, (response) => {
                    response.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        const publicUrl = `https://${process.env.NEXT_PUBLIC_APP_URL || 'englishcolonyuos.org'}/videos/${safeName}`;

                        bot.sendMessage(chatId, `✅ Video Uploaded Successfully!
                        
📂 Filename: ${safeName}
🔗 Public URL: ${publicUrl}

To use in website, add this filename to your database.`);
                    });
                }).on('error', (err) => {
                    fs.unlink(filePath, () => { }); // Delete partial file
                    bot.sendMessage(chatId, `❌ Download Failed: ${err.message}`);
                });

            } catch (error) {
                console.error('Bot Error:', error);
                bot.sendMessage(chatId, `❌ Error: ${error.message}`);
            }
        }
        else if (msg.text === '/start') {
            bot.sendMessage(chatId, '👋 Welcome Admin! Send me a video to upload it to your website.');
        }
        else {
            bot.sendMessage(chatId, 'Send me a video file to upload.');
        }
    });

    bot.on('polling_error', (error) => {
        console.error('Telegram Polling Error:', error.code);  // Log but don't crash
    });
}

module.exports = { initBot };

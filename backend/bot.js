require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;
const apiBaseUrl = process.env.API_BASE_URL;

if (!token || !webAppUrl || !apiBaseUrl) {
    console.error('Ошибка: Не все переменные окружения заданы в файле .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/start')) {
        const chatId = msg.chat.id.toString();
        const username = msg.from.username || `user_${chatId}`;
        const parts = msg.text.split(' ');
        const referrerId = parts.length > 1 ? parts[1] : null;

        console.log(`[BOT] Received /start from ${chatId}. Referrer: ${referrerId || 'none'}`);

        axios.post(`${apiBaseUrl}/register`, {
            telegram_id: chatId,
            username: username,
            referrer_id: referrerId
        }).catch(err => {
            if (err.response) {
                console.error(`[BOT] API Error for user ${chatId}:`, err.response.status, err.response.data);
            } else {
                console.error(`[BOT] Failed to process registration for user ${chatId}:`, err.message);
            }
        });

        bot.sendMessage(chatId, 'Добро пожаловать в Brainrot Manager! Нажмите кнопку ниже, чтобы начать.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🧠 Открыть игру', web_app: { url: webAppUrl } }]
                ]
            }
        });
    }
});

console.log('[BOT] Bot has been started...');
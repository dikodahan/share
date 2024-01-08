import axios from "axios";

class TelegramChat {
    private readonly client = axios.create({
        baseURL: `https://api.telegram.bot/bot${process.env.TELEGRAM_TOKEN}`
    })
    public constructor() { }
    async sendfile() {
        try {
            const res = await this.client.post("/sendMesage", {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: "Testing Telegram",
            })
            console.log(res.data)
        }
        catch (e) {
            console.error(e)
        }
    }
}
export const telegramChat = new TelegramChat()
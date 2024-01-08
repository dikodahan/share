import axios from "axios";
import FormData from "form-data";

class TelegramChat {
  private readonly client = axios.create({
    baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`,
  });

  public async getMe() {
    try {
      const res = await this.client.get("/getMe");
      console.log(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  public async sendDocument(caption: string, filename: string, content: string): Promise<void> {
    try {
      const form = new FormData();
      form.append("chat_id", process.env.TELEGRAM_CHAT_ID);
      form.append("caption", caption);
      form.append("document", Buffer.from(content), filename);
      const res = await this.client.post("/sendDocument", form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      console.log(res.data);
    } catch (e) {
      console.error(e);
    }
  }
}
export const telegramChat = new TelegramChat();

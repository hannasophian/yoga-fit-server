const axios = require("axios").default;
import { config } from "dotenv";
config();

export default function sendVerificationEmail(
  user_name: string,
  user_email: string,
  user_id: number
): void {
  try {
    const response = axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      accessToken: process.env.EMAILJS_ACCESS_TOKEN,
      template_params: {
        to_email: user_email,
        to_name: user_name,
        verification_url: `google.com/${user_id}`,
      },
    });
  } catch (err) {
    console.error(err);
  }
}

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  // In development, just log the email
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Email not sent in development");
    console.log({
      to,
      subject,
      text,
      from: "WordDirectory <noreply@worddirectory.app>",
    });
    console.log("Email HTML:", html);
    return { id: "dev-mode" };
  }

  // In production, actually send the email
  try {
    const { data, error } = await resend.emails.send({
      from: "WordDirectory <admin@worddirectory.app>",
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

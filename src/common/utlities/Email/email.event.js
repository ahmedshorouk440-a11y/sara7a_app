
import {EventEmitter} from "node:events"
import { sendemail } from "./send.email.js";
import { verifyEmailTemplete } from "./email.templates.js";


export const emailEvent = new EventEmitter();


emailEvent.on("sendEmail", async ({ recipients, subject, data }) => {
  try {
    await sendemail({
      ...recipients,
      subject,
      html: verifyEmailTemplete({ subject, ...data }),
    });
  } catch (error) {
    console.error("Email event failed:", error);
  }
});
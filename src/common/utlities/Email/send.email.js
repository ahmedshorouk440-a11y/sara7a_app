
import nodemailer from "nodemailer";
import { BadRequestExcption } from "../../Exption/index.js";


const transporter = nodemailer.createTransport({
 service: 'gmail' , 
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.App_Password,
  },
});

export const sendemail =async({
     to, 
    subject, 
    text, 
    html, 
})=>{
try {
    if(!to?.length && !bcc?.length && !cc?.length){
               throw BadRequestExcption("Missing email Recipients")
    }
     if(!html?.length && !text?.length){
               throw BadRequestExcption("Missing email Content")
    }
  const info = await transporter.sendMail({
    from: `"${process.env.APPLICATION_NAME}" <${process.env.APP_EMAIL}>`, 
    to, 
    subject, 
    text, 
    html, 
  });


} catch (err) {
  console.error("Error while sending mail:", err);
}
}
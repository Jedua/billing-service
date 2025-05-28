import nodemailer, { SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MAIL_FROM   ) throw new Error('Falta MAIL_FROM en .env');
if (!process.env.MAIL_HOST   ) throw new Error('Falta MAIL_HOST en .env');
if (!process.env.MAIL_PORT   ) throw new Error('Falta MAIL_PORT en .env');
if (!process.env.MAIL_USERNAME) throw new Error('Falta MAIL_USERNAME en .env');
if (!process.env.MAIL_PASSWORD) throw new Error('Falta MAIL_PASSWORD en .env');

export const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function sendInvoiceEmail(
  customer: { name: string; email: string },
  payload: { InvoiceNumber: string; EmailAlternativo?: string }
) {
  // construimos un string[] filtrando posibles undefined
  const toList = [customer.email, payload.EmailAlternativo]
    .filter((e): e is string => !!e);

  const mailOpts: SendMailOptions = {
    from:    process.env.MAIL_FROM!,   // con ! TypeScript sabe que no es undefined
    to:      toList,                   // string[]
    subject: `Tu factura ${payload.InvoiceNumber}`,
    text:    `Hola ${customer.name},\n\nAdjunto tu factura ${payload.InvoiceNumber}.\n\nSaludos.`,
    attachments: [
      // aquí podrías adjuntar tu PDF / XML:
      // { filename: `${payload.InvoiceNumber}.pdf`, path: '/tmp/abc.pdf' },
    ]
  };

  const info = await transporter.sendMail(mailOpts);
  console.log('Correo enviado:', info.messageId);
  return info;
}

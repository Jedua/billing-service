// src/config/mailer.ts
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

export interface SendInvoiceEmailParams {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  ccEmail?: string;
  pdfBuffer: Buffer;
}

/**
 * Envía un correo con la factura PDF adjunta.
 */
export async function sendInvoiceEmail({
  customerName,
  customerEmail,
  invoiceNumber,
  ccEmail,
  pdfBuffer
}: SendInvoiceEmailParams) {
  // construye la lista de destinatarios (to y cc)
  const toList = [customerEmail];
  const ccList = ccEmail ? [ccEmail] : [];

  const mailOpts: SendMailOptions = {
    from:    process.env.MAIL_FROM!,   // e.g. '"Mi Empresa" <no-reply@empresa.com>'
    to:      toList,
    cc:      ccList,
    subject: `Tu factura ${invoiceNumber}`,
    text:    `Hola ${customerName},\n\nAdjunto encontrarás tu factura ${invoiceNumber}.\n\n¡Saludos!`,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content:  pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOpts);
  console.log(`Correo enviado a ${toList.join(', ')}${ccList.length ? ` (cc: ${ccList.join(', ')})` : ''}`, info.messageId);
  return info;
}

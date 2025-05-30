import Facturapi from 'facturapi';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.FACTURAPI_KEY_TEST) throw new Error('Falta FACTURAPI_KEY_TEST en .env');

export const facturapi = new Facturapi(process.env.FACTURAPI_KEY_TEST);

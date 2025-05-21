import { Readable } from 'stream';
import Facturapi from 'facturapi';
import { Request, Response } from 'express';

export interface FacturapiCustomerAddress {
  street: string;
  exterior: string;
  interior?: string;
  neighborhood: string;
  zip: string;
  city: string;
  municipality: string;
  state: string;
  country: string; // Debe ser: 'MEX'
}

export interface FacturapiCustomerData {
  legal_name: string;         // Nombre o razón social
  tax_id: string;             // RFC
  email: string;
  address: FacturapiCustomerAddress;
  tax_system?: string;        // Código régimen fiscal SAT (opcional pero recomendado)
  phone?: string;
}

export interface FacturapiInvoiceItem {
  product: string;            // Nombre/ID del producto
  quantity: number;
  unit_price: number;
  product_key?: string;       // Clave SAT (ejemplo: "81112100")
  unit_key?: string;          // Clave unidad SAT (ejemplo: "E48")
  description?: string;
  taxes?: Array<{
    type: 'IVA' | 'ISR';
    rate: number;
    withheld?: boolean;
  }>;
  discount?: number;
}

export interface FacturapiInvoiceData {
  customer: string;               // ID del cliente en Facturapi
  items: FacturapiInvoiceItem[];
  payment_form: string;           // Clave SAT (ej. "03")
  payment_method: string;         // Clave SAT (ej. "PUE")
  use: string;                    // Uso de CFDI (ej. "G03")
  series?: string;
  folio_number?: string;
}


const facturapiKey = process.env.FACTURAPI_KEY_TEST as string;
const facturapi = new Facturapi(facturapiKey);

export const syncCustomer = async (
  customerData: FacturapiCustomerData, 
  existingFacturapiId?: string
) => {
  if (existingFacturapiId) {
    return await facturapi.customers.update(existingFacturapiId, customerData);
  } else {
    return await facturapi.customers.create(customerData);
  }
};

export const getInvoicePDFBuffer = async (id: string): Promise<Buffer> => {
    const pdfStream = await facturapi.invoices.downloadPdf(id);
    
    if (!(pdfStream instanceof Readable)) {
        throw new Error('Respuesta inválida de Facturapi');
    }

    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        
        pdfStream.on('data', (chunk) => chunks.push(chunk));
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', reject);
    });
};


export const downloadInvoicePDF = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            code: 'MISSING_ID',
            message: 'ID de factura requerido'
        });
    }

    try {
        const pdfBuffer = await getInvoicePDFBuffer(id);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="factura_${id}.pdf"`);
        res.send(pdfBuffer);

    } catch (err) {
        const error = err as Error;
        console.error(`Error descargando PDF ${id}:`, error.message);
        
        res.status(500).json({
            code: 'FACTURAPI_ERROR',
            message: 'Error al generar PDF',
            details: error.message
        });
    }
};

export const createInvoice = async (invoiceData: FacturapiInvoiceData) => {
  return await facturapi.invoices.create(invoiceData);
};

export const getInvoiceStatus = async (facturapiInvoiceId: string) => {
  return await facturapi.invoices.retrieve(facturapiInvoiceId);
};

/**
 * Descarga el PDF de una factura desde Facturapi y lo regresa como Buffer.
 * @param id ID de la factura en Facturapi
 * @returns Buffer del PDF
 */
export async function getInvoicePDF(id: string): Promise<Buffer> {
    const pdfStream = await facturapi.invoices.downloadPdf(id);

    if (!(pdfStream instanceof Readable)) {
        throw new Error('Respuesta inválida de Facturapi, no es un stream');
    }

    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        pdfStream.on('data', (chunk) => chunks.push(chunk));
        pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
        pdfStream.on('error', reject);
    });
}
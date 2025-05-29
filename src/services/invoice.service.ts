import { facturapi } from '../config/facturapi';
import { sendInvoiceEmail } from '../config/mailer';
import { Customer } from '../models/customer.model';
import { Invoice } from '../models/invoice.model';
import { InvoiceItem } from '../models/invoice-item.model';
import { Product } from '../models/product.model';
import { InvoiceLog } from '../models/invoice-log.model';
import sequelize from '../config/database';
import {
    syncCustomer,
    createInvoice as facturapiCreateInvoice,
    getInvoicePDF
} from './facturapi.service';

import dotenv from 'dotenv';
dotenv.config();


export const TAX_SYSTEM = Number(process.env.TAX_SYSTEM) || 601;
export interface AddressDto {
    internal_number: any;
    exterior_number: any;
    street: string;
    exterior: string;
    interior?: string;
    neighborhood: string;
    city: string;
    municipality: string;
    zip_code: string;
    state: string;
    country: string;  // ISO 3 letras,  "MEX"
}
export interface CreateInvoicePayload {
    IdUser: number;
    IdSuscription: number;
    SubscriptionIdOpenPay: string;
    ChargeIdOpenPay: string;
    PeriodStart: string;
    PeriodEnd: string;
    InvoiceNumber: string;
    Customer: {
        rfc: string;
        name: string;
        email: string;
        uso_cfdi: string;
        tax_system: string;
        address: AddressDto;
        phone?: string;
    };
    EmailAlternativo?: string;
    Items: Array<{
        quantity: number;
        product: { description: string; product_key: string; price: number };
    }>;
}

export interface CreateInvoiceDto {
    customerId: number;
    externalId?: string;
    status?: string;
    total?: number;
}

export interface UpdateInvoiceDto {
    externalId?: string;
    status?: string;
    total?: number;
}


export async function createInvoice(dto: CreateInvoiceDto) {
    const invoice = await Invoice.create({
        customerId: dto.customerId,
        externalId: dto.externalId ?? null,
        status: dto.status ?? 'draft',
        total: dto.total ?? 0,
    });
    return invoice;
}

export async function getInvoiceById(invoiceId: number) {
    return Invoice.findByPk(invoiceId);
}

export async function listInvoicesByVirwoUserId(virwoUserId: number) {
    const customer = await Customer.findOne({ where: { virwoUserId } });
    if (!customer) return [];
    return Invoice.findAll({ where: { customerId: customer.id } });
}

export async function updateInvoice(
    invoiceId: number,
    dto: UpdateInvoiceDto
) {
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) throw new Error(`Invoice id=${invoiceId} no encontrada`);
    await invoice.update(dto);
    return invoice;
}

export async function issueInvoiceHandler(payload: CreateInvoicePayload) {
    return sequelize.transaction(async tx => {
        // — 1) CREAR/ACTUALIZAR CUSTOMER local —
        let customer = await Customer.findOne({
            where: { virwoUserId: payload.IdUser },
            transaction: tx
        });
        if (!customer) {
            customer = await Customer.create({
                virwoUserId: payload.IdUser,
                name: payload.Customer.name,
                email: payload.Customer.email,
                taxId: payload.Customer.rfc,
                address: JSON.stringify(payload.Customer.address),
                phone: payload.Customer.phone,
                facturapiCustomerId: undefined
            }, { transaction: tx });
            console.log(`[IssueInvoice] Nuevo customer local id=${customer.id}`);
        } else {
            const updates: Partial<{
                name: string;
                email: string;
                taxId: string;
                address: string;
                phone: string;
                updatedAt: Date;
            }> = {};
            if (customer.name !== payload.Customer.name) updates.name = payload.Customer.name;
            if (customer.email !== payload.Customer.email) updates.email = payload.Customer.email;
            if (customer.taxId !== payload.Customer.rfc) updates.taxId = payload.Customer.rfc;
            if (customer.address !== JSON.stringify(payload.Customer.address)) updates.address = JSON.stringify(payload.Customer.address);
            if (customer.phone !== payload.Customer.phone) updates.phone = payload.Customer.phone!;
            if (Object.keys(updates).length) {
                updates.updatedAt = new Date();
                await customer.update(updates, { transaction: tx });
                console.log(`[IssueInvoice] Customer local actualizado id=${customer.id}`);
            } else {
                console.log(`[IssueInvoice] Customer local sin cambios id=${customer.id}`);
            }
        }

        // — 2) sincronizar con Facturapi customer —
        if (!customer.facturapiCustomerId) {
            // mapeo de tu objeto Customer ➡️ payload para Facturapi
            const facturapiPayload = {
                legal_name: customer.name,
                tax_id: customer.taxId,
                tax_system: TAX_SYSTEM,
                email: customer.email,
                phone: payload.Customer.phone || undefined,
                default_invoice_use: payload.Customer.uso_cfdi,
                address: {
                    street: payload.Customer.address.street,
                    exterior: payload.Customer.address.exterior_number,
                    interior: payload.Customer.address.internal_number,
                    neighborhood: payload.Customer.address.neighborhood,
                    city: payload.Customer.address.city,
                    municipality: payload.Customer.address.city,
                    zip: payload.Customer.address.zip_code,
                    state: payload.Customer.address.state,
                    country: payload.Customer.address.country,
                }
            };

            console.log(`[IssueInvoice] Creando cliente en Facturapi para virwoUserId=${payload.IdUser}...`);
            const facCust = await facturapi.customers.create(facturapiPayload);
            // guardamos el ID que nos devuelve Facturapi
            customer.facturapiCustomerId = facCust.id;
            await customer.save({ transaction: tx });
            console.log(`[IssueInvoice] Cliente Facturapi creado: ${facCust.id}`);
        } else {
            console.log(`[IssueInvoice] Cliente ya sincronizado: ${customer.facturapiCustomerId}`);
        }

        // — 3) asegurar productos en tu catálogo local —
        for (const item of payload.Items) {
            let prod = await Product.findOne({
                where: {
                    customerId: customer.id,
                    name: item.product.product_key
                },
                transaction: tx
            });
            if (!prod) {
                prod = await Product.create({
                    customerId: customer.id,
                    name: item.product.product_key,
                    description: item.product.description,
                    price: item.product.price,
                    taxRate: 0
                }, { transaction: tx });
                console.log(`[IssueInvoice] Producto creado -> ${prod.name} para customerId=${customer.id}`);
            } else {
                console.log(`[IssueInvoice] Producto existente -> ${prod.name} para customerId=${customer.id}`);
            }
        }
        console.log('paso 1,2 y 3 completados: ', customer.id);
        console.log('customer.facturapiCustomerId: ', customer.facturapiCustomerId);

        // — 4) Emitir factura en Facturapi usando tu helper —  
        const invoiceData = {
            customer: customer.facturapiCustomerId!,
            items: payload.Items.map(i => {
                // Sanitizar clave de producto
                let productKey = i.product.product_key.replace(/[^A-Za-z0-9]/g, '');

                // Validar clave SAT (8 dígitos)
                if (!/^\d{8}$/.test(productKey)) {
                    productKey = "85121800"; // Clave SAT por defecto (servicios)
                    console.warn(`Clave de producto inválida. Usando valor por defecto: ${productKey}`);
                }

                return {
                    quantity: i.quantity,
                    product: {  // Objeto product con todos los detalles
                        product_key: productKey,
                        description: i.product.description.substring(0, 250), // Máximo 250 caracteres
                        price: i.product.price,
                        tax_included: true, // Precio incluye impuestos
                        taxes: [{ // Impuestos requeridos
                            type: 'IVA',
                            rate: 0, // Tasa 0%
                            factor: 'Tasa'
                        }]
                    }
                };
            }),
            payment_form: '03',
            payment_method: 'PUE',
            use: payload.Customer.uso_cfdi,
            series: process.env.FACTURAPI_SERIES,
            folio_number: Number(payload.InvoiceNumber.split('-')[1]),
        };

        // console.log('[IssueInvoice] Emisión Facturapi…', JSON.stringify(invoiceData, null, 2));
        const facInvoice = await facturapi.invoices.create(invoiceData);
        console.log('[IssueInvoice] Respuesta Facturapi…', JSON.stringify(facInvoice, null, 2));


        // — 5) guardar factura local —
        const inv = await Invoice.create({
            customerId: customer.id,
            externalId: facInvoice.id,
            status: facInvoice.status,
            total: facInvoice.total
        }, { transaction: tx });
        console.log(`[IssueInvoice] Factura local creada id=${inv.id}, total=${inv.total}`);

        // TODO: 6) — guardar líneas —
        const lineItems: InvoiceItem[] = [];
        for (const item of payload.Items) {
            // localiza el producto
            const prodLocal = await Product.findOne({
                where: {
                    customerId: customer.id,
                    name: item.product.product_key.replace(/[^A-Za-z0-9]/g, '')
                },
                transaction: tx
            });
            if (!prodLocal) {
                throw new Error(
                    `No se encontró producto local para clave "${item.product.product_key}" en customerId=${customer.id}`
                );
            }
            // inserta la línea
            const line = await InvoiceItem.create({
                invoiceId: inv.id,
                productId: prodLocal.id,
                quantity: item.quantity,
                unitPrice: item.product.price,
                total: item.quantity * item.product.price
            }, { transaction: tx });
            lineItems.push(line);
        }

        // TODO: 7) — log para auditoría —

        // Paso 7) log de auditoría
        await InvoiceLog.create({
            invoiceId: inv.id,
            event: 'Factura emitida',
            details: `Facturapi ID=${facInvoice.id}`
        }, { transaction: tx });

        // TODO: 8) — enviar correo —

        const pdfBuffer = await getInvoicePDF(facInvoice.id);
        await sendInvoiceEmail({
            customerName: customer.name,
            customerEmail: customer.email,
            invoiceNumber: payload.InvoiceNumber,
            ccEmail: payload.EmailAlternativo ||`eduardo.campuzano@virwo.com`, // opcional payload.EmailAlternativo
            pdfBuffer
        });

        // TODO: 9) — devolver resultado al front —
        return { success: true, invoiceId: inv.id };
    });

}

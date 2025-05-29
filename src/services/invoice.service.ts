import { facturapi } from '../config/facturapi';
import { sendInvoiceEmail } from '../config/mailer';
import { Customer } from '../models/customer.model';
import { Invoice } from '../models/invoice.model';
import { InvoiceItem } from '../models/invoice-item.model';
import { Product } from '../models/product.model';
import { InvoiceLog } from '../models/invoice-log.model';
import sequelize from '../config/database';

// src/services/invoice.service.ts

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
  country: string;  // ISO 3 letras, e.g. "MEX"
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
                legal_name: customer.name,              // nombre o razón social
                tax_id: customer.taxId,             // RFC
                tax_system: payload.Customer.uso_cfdi,  // régimen fiscal (ej. "601")
                email: customer.email,
                phone: payload.Customer.phone || undefined,  // debe ser número
                default_invoice_use: payload.Customer.uso_cfdi,  // uso de CFDI para facturar
                address: {
                    street: payload.Customer.address.street,         // "Blvd. Atardecer"
                    exterior: payload.Customer.address.exterior_number, // 142
                    interior: payload.Customer.address.internal_number, // 4
                    neighborhood: payload.Customer.address.neighborhood,    // "Centro"
                    city: payload.Customer.address.city,            // "Huatabampo"
                    municipality: payload.Customer.address.city,            // o payload.Customer.address.municipality
                    zip: payload.Customer.address.zip_code,    // 86500
                    state: payload.Customer.address.state,           // "Sonora"
                    country: payload.Customer.address.country,         // "MEX"
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
        // // — 3) asegurar productos en tu catálogo local —
        // for (const item of payload.Items) {
        //     let prod = await Product.findOne({
        //         where: {
        //             customerId: customer.id,
        //             name: item.product.product_key
        //         },
        //         transaction: tx
        //     });
        //     if (!prod) {
        //         prod = await Product.create({
        //             customerId: customer.id,
        //             name: item.product.product_key,
        //             description: item.product.description,
        //             price: item.product.price,
        //             taxRate: 0
        //         }, { transaction: tx });
        //         console.log(`[IssueInvoice] Producto creado -> ${prod.name} para customerId=${customer.id}`);
        //     } else {
        //         console.log(`[IssueInvoice] Producto existente -> ${prod.name} para customerId=${customer.id}`);
        //     }
        // }

        // TODO: 4) — crear factura en Facturapi —

        // TODO: 5) — guardar factura local —

        // TODO: 6) — guardar líneas —

        // TODO: 7) — log para auditoría —

        // TODO: 8) — enviar correo —

        // TODO: 9) — devolver resultado al front —

    });

}

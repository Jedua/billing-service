import { facturapi } from '../config/facturapi';
import { sendInvoiceEmail } from '../config/mailer';
import { Customer } from '../models/customer.model';
import { Invoice } from '../models/invoice.model';
import { InvoiceItem } from '../models/invoice-item.model';
import { Product } from '../models/product.model';
import { InvoiceLog } from '../models/invoice-log.model';
import sequelize from '../config/database';

export interface CreateInvoicePayload {
    IdUser: number;
    IdSuscription: number;
    SubscriptionIdOpenPay: string;
    ChargeIdOpenPay: string;
    PeriodStart: string;
    PeriodEnd: string;
    InvoiceNumber: string;
    Customer: { rfc: string; name: string; email: string; uso_cfdi: string };
    EmailAlternativo?: string;
    Items: Array<{
        quantity: number;
        product: { description: string; product_key: string; price: number };
    }>;
}

export async function issueInvoiceHandler(payload: CreateInvoicePayload) {
    return sequelize.transaction(async tx => {
        // — 1) CREAR/ACTUALIZAR CUSTOMER local —
        let customer = await Customer.findOne({ where: { virwoUserId: payload.IdUser }, transaction: tx });
        if (!customer) {
            customer = await Customer.create({
                virwoUserId: payload.IdUser,
                name: payload.Customer.name,
                email: payload.Customer.email,
                taxId: payload.Customer.rfc,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction: tx });
        } else {
            // Defino aquí un objeto de actualización con un tipo claro:
            const upd: Partial<{
                name: string;
                email: string;
                taxId: string;
                updatedAt: Date;
            }> = {};

            if (customer.name !== payload.Customer.name) upd.name = payload.Customer.name;
            if (customer.email !== payload.Customer.email) upd.email = payload.Customer.email;
            if (customer.taxId !== payload.Customer.rfc) upd.taxId = payload.Customer.rfc;

            if (Object.keys(upd).length > 0) {
                upd.updatedAt = new Date();
                await customer.update(upd, { transaction: tx });
            }
        }

        // 2) — sincronizar con Facturapi customer —
        if (!customer.facturapiCustomerId) {
            const facCust = await facturapi.customers.create({
                name: customer.name,
                email: customer.email,
                tax_id: customer.taxId
            });
            customer.facturapiCustomerId = facCust.id;
            await customer.save({ transaction: tx });
        }

        // 3) — asegurar productos en tu catálogo local —
        for (const item of payload.Items) {
            let prod = await Product.findOne({
                where: { userId: payload.IdUser, name: item.product.product_key },
                transaction: tx
            });
            if (!prod) {
                await Product.create({
                    userId: payload.IdUser,
                    name: item.product.product_key,
                    description: item.product.description,
                    price: item.product.price,
                    taxRate: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { transaction: tx });
            }
        }

        // 4) — crear factura en Facturapi —
        const facInvoice = await facturapi.invoices.create({
            customer: customer.facturapiCustomerId!,
            items: payload.Items.map(i => ({
                quantity: i.quantity,
                product_key: i.product.product_key,
                description: i.product.description,
                unit_price: i.product.price
            })),
            cfdi_use: payload.Customer.uso_cfdi,
            payment_form: '03',
            payment_method: '09',
            currency: 'MXN',
            expedition_place: '06100',
            send: true,
            email: payload.EmailAlternativo || payload.Customer.email
        });

        // 5) — guardar factura local —
        const inv = await Invoice.create({
            userId: payload.IdUser,
            customerId: customer.id,
            externalId: facInvoice.id,
            status: facInvoice.status,
            total: facInvoice.total,
            createdAt: new Date(),
            updatedAt: new Date()
        }, { transaction: tx });

        // 6) — guardar líneas —
        for (const item of payload.Items) {
            const prod = await Product.findOne({
                where: { userId: payload.IdUser, name: item.product.product_key },
                transaction: tx
            });
            await InvoiceItem.create({
                invoiceId: inv.id,
                productId: prod!.id,
                quantity: item.quantity,
                unitPrice: item.product.price,
                total: item.quantity * item.product.price,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction: tx });
        }

        // 7) — log para auditoría —
        await InvoiceLog.create({
            invoiceId: inv.id,
            event: 'ISSUED',
            details: JSON.stringify(facInvoice),
            createdAt: new Date()
        }, { transaction: tx });

        // 8) — enviar correo —
        await sendInvoiceEmail(
            { name: customer.name, email: customer.email },
            {
                InvoiceNumber: payload.InvoiceNumber,
                EmailAlternativo: payload.EmailAlternativo
            }
        );

        // 9) — devolver resultado al front —
        return {
            invoiceId: inv.id,
            externalId: facInvoice.id,
            status: facInvoice.status,
            total: facInvoice.total
        };
    });
}

import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
} from "@paypal/paypal-server-sdk";
import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.CAP_SECRET;

function decryptAES256(encrypted, iv) {
    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET_KEY),
        Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.NODE_ENV == 'production' ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SAND,
        oAuthClientSecret: process.env.NODE_ENV == 'production' ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET_SAND,
    },
    timeout: 0,
    environment: Environment.Sandbox,
});

const ordersController = new OrdersController(client);


export const POST = async (req) => {
    const { domain, amount, iv } = await req.json();
    const decryptedDomain = decryptAES256(domain, iv);
    const decryptedAmount = decryptAES256(amount, iv);
    const collect = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD",
                        value: decryptedAmount,
                    },
                },
            ],
        },
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.createOrder(
            collect
        );
        const bodyJ = JSON.parse(body);
        // console.log("Order created successfully:", bodyJ);
        return NextResponse.json(bodyJ, { status: httpResponse.statusCode });
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json({ error: error }, { status: 500 });
        }
    }
}  
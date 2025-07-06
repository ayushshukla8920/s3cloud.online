import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
    key_id: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST,
    key_secret: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET : process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET_TEST,
});

export const POST = async (req) => {
    try {
        const { amount } = await req.json();
        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }
        const options = {
            amount: amount * 85 * 100,
            currency: 'INR',
            receipt: 'Receipt',
            notes: {},
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json(order, {status: 200}); 
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
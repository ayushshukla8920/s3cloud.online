'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Paypal from '@/components/paypal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from "next/image"

export default function PaymentPage() {
  const [message, setMessage] = useState('');
  const [domain, setDomain] = useState('');
  const [amount, setAmount] = useState('');
  const searchParams = useSearchParams();
  const d = searchParams.get("d");
  const a = searchParams.get("a");
  const iv = searchParams.get("iv");
  const PaywithRazorpay = async () => {
    const response = await fetch('/api/orders/create-razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: amount })
    });
    const order = await response.json();
    const options = {
      key: process.env.NODE_ENV === 'production' ? 'rzp_test_LcC5KDhHEw2Ljp' : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST,
      amount: order.amount,
      currency: order.currency,
      name: 'S3Cloud Domains',
      description: 'Purchase for subdomain: ' + domain,
      order_id: order.id,
      image: '/S3.png',
      callback_url: 'https://s3cloud.online/payment-success',
      prefill: {
      },
      theme: {
        color: '#8E24AA'
      },
      handler: function (response) {
        fetch('/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        }).then(res => res.json())
          .then(data => {
            if (data.status === 'ok') {
              window.location.href = '/payment-success';
            } else {
              alert('Payment verification failed');
            }
          }).catch(error => {
            console.error('Error:', error);
            alert('Error verifying payment');
          });
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  useEffect(() => {
    const decryptData = async () => {
      try {
        const res = await fetch("/api/decrypt-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ d, a, iv }),
        });

        const data = await res.json();
        if (data?.domain && data?.amount) {
          setDomain(data.domain);
          setAmount(data.amount);
        } else {
          router.push("/checkout");
        }
      } catch (err) {
        console.error("Failed to decrypt", err);
        router.push("/");
      }
    };

    if (d && a && iv) {
      decryptData();
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Image src="/S3.png" alt="S3Cloud" width={40} height={40} />
              <span className="text-2xl font-bold text-gray-900">S3Cloud Domains</span>
            </div>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 flex justify-center">
        <Card className="w-full max-w-lg border-[1px] border-black shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
              Confirm Your Purchase
            </h1>
            <p className="text-center text-gray-600 font-bold text-xl mb-6">
              Domain: <span className="font-medium text-blue-700">{domain}</span><br />
              Amount to be paid: <span className="font-medium text-green-700">${amount}</span>
            </p>

            <div className="mb-6 flex flex-col gap-10">
              <button
                onClick={PaywithRazorpay}
                className='hover:cursor-pointer w-full h-15 bg-[#02042C] text-white font-semibold rounded shadow hover:opacity-80 transition-all flex items-center justify-center'
              >Pay with <img src="https://d6xcmfyh68wv8.cloudfront.net/newsroom-content/uploads/2021/02/white.png" alt="Razorpay" className=" mx-3 h-8 w-40" />
              </button>
              <hr className='h-[2px] text-black bg-black' />
              <Paypal setMessage={setMessage} d={d} a={a} iv={iv} />
            </div>
            {message && (
              <div className="text-sm text-gray-700 text-center border-t pt-4 mt-4">
                {message}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link
                href={`/`}
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Cancel Purchase
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/S3.png" alt="S3Cloud" className="w-6 h-6" />
            <span className="text-xl font-bold">S3Cloud Domains</span>
          </div>
          <p className="text-gray-400">© 2024 S3Cloud Domains. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

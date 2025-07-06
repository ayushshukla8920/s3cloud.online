"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const d = searchParams.get("d");
  const a = searchParams.get("a");
  const iv = searchParams.get("iv");
  const [domain, setDomain] = useState('');
  const [errorRedirect, setErrorRedirect] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [domainPrice, setDomainPrice] = useState(1.99);
  const [subdomainCount, setSubdomainCount] = useState(0);
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
        } else {
          router.push("/checkout");
        }
      } catch (err) {
        console.error("Failed to decrypt", err);
        router.push("/checkout");
      }
    };

    if (d && a && iv) {
      decryptData();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?domain=${domain}`);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await fetch("/api/getuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const userData = await userRes.json();
        if (!userData?.email) {
          router.push(`/login?domain=${domain}`);
          return;
        }
        setUserEmail(userData.email);

        // Fetch subdomain count
        const countRes = await fetch("/api/domain-count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const countData = await countRes.json();
        const count = countData.subdomainCount || 0;
        setSubdomainCount(count);

        if (count >= 5) {
          setDomainPrice(0.99);
        } else {
          setDiscountApplied(true); // FREEDOMAIN auto-applied
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user or domain count", err);
        router.push(`/login?domain=${domain}`);
      }
    };

    fetchUserData();
  }, [domain, router]);
  const handlePromoApply = () => {
    const code = promoCode.trim().toUpperCase();

    if (subdomainCount >= 5) {
      if (code == "SPECIAL40") {
        setDiscountApplied(true);
      } else {
        setDiscountApplied(false);
        alert("Invalid Promo Code");
      }
    } else {
      if (code == "FREEDOMAIN") {
        setDiscountApplied(true);
      } else {
        setDiscountApplied(false);
        alert("Invalid Promo Code");
      }
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    if (!token || !domain) {
      alert("Missing token or domain");
      return;
    }

    setIsCheckingOut(true);
    setErrorRedirect("");

    try {
      const res = await fetch("/api/register-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwt: token,
          alias: domain,
          ipaddr: "0.0.0.0",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        if (data?.err?.includes("Payment required")) {
          const encryptRes = await fetch("/api/encrypt-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain,
              amount: discountedPrice,
            }),
          });

          const { domain: encDomain, amount: encAmount, iv } = await encryptRes.json();

          router.push(`/payment?d=${encDomain}&a=${encAmount}&iv=${iv}`);
        } else {
          setErrorRedirect("Something went wrong. Redirecting to home...");
          startRedirectCountdown(0);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorRedirect("Unexpected error. Redirecting to home...");
      startRedirectCountdown(0);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const startRedirectCountdown = (type) => {
    let seconds = type === 1 ? 5 : 3;
    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        setErrorRedirect(
          type === 1
            ? `Payment required: Free users can only register up to 5 subdomains. Redirecting to payment page in ${seconds}...`
            : `Something went wrong. Redirecting to home in ${seconds}...`
        );
      } else {
        clearInterval(interval);
        router.push(type === 1 ? "/payment" : "/");
      }
    }, 1000);
  };

  if (loading)
    return <div className="p-10 text-center text-lg">Loading...</div>;

  const discountedPrice =
    subdomainCount >= 5 && discountApplied
      ? (domainPrice * 0.6).toFixed(2)
      : discountApplied
        ? (domainPrice * 0).toFixed(2)
        : domainPrice.toFixed(2);

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
      <div className="mt-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center w-full max-w-2xl space-y-6">

          {/* Info banner for subdomain limit */}
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg text-sm text-center w-full">
            Free users can register up to <strong>5 subdomains</strong>. Additional domains are paid.
          </div>

          {/* Special40 offer banner */}
          {subdomainCount >= 5 && !discountApplied && (
            <div className="flex justify-between items-center bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-lg text-sm w-full">
              <span>
                Use coupon <strong>SPECIAL40</strong> for <strong>40% OFF</strong> your next domain!
              </span>
            </div>
          )}

          {/* Checkout Card */}
          <Card className="w-full shadow-xl border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Checkout
              </h2>
              <div className="text-gray-700 mb-2">
                <strong>Domain:</strong> {domain}
              </div>
              <div className="text-gray-700 mb-2">
                <strong>Account:</strong> {userEmail}
              </div>

              <div className="my-4 border-t border-gray-300 pt-4">
                <div className="flex justify-between text-gray-800 mb-2">
                  <span>Domain Price</span>
                  <span>${domainPrice.toFixed(2)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>
                      Promo Applied ({subdomainCount >= 5 ? "SPECIAL40" : "FREEDOMAIN"})
                    </span>
                    <span>
                      -${(domainPrice - parseFloat(discountedPrice)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>${discountedPrice}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                />
                <Button className="hover:cursor-pointer" type="button" onClick={handlePromoApply}>
                  Apply
                </Button>
              </div>

              <Button
                className="hover:cursor-pointer mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Validating Payment...</span>
                  </div>
                ) : discountApplied ? (
                  "Complete Checkout"
                ) : (
                  "Complete Checkout"
                )}
              </Button>

              {errorRedirect && (
                <p
                  className={`mt-4 rounded-xl text-center py-2 px-3 font-bold ${errorRedirect.includes("Payment")
                    ? "bg-yellow-600/70 text-black"
                    : "bg-red-600/70 text-white"
                    }`}
                >
                  {errorRedirect}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

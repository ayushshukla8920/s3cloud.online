"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain");
  const [errorRedirect, setErrorRedirect] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?domain=${domain}`);
      return;
    }

    fetch("/api/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setUserEmail(data.email);
        } else {
          router.push(`/login?domain=${domain}`);
        }
        setLoading(false);
      });
  }, [domain, router]);

  const handlePromoApply = () => {
    if (promoCode.trim().toUpperCase() === "FREEDOMAIN") {
      setDiscountApplied(true);
    } else {
      setDiscountApplied(false);
      alert("Invalid Promo Code");
    }
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    if (!token || !domain) {
      alert("Missing token or domain");
      return;
    }
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/register-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwt: token,
          alias: domain,
          ipaddr: "0.0.0.0", // or replace with actual IP logic if needed
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Successfully registered domain
        router.push("/dashboard");
      } else {
        // ❌ Registration failed
        setErrorRedirect("Something went wrong. Redirecting to home in 3...");
        startRedirectCountdown();
      }
    } catch (err) {
      setErrorRedirect("Something went wrong. Redirecting to home in 3...");
      startRedirectCountdown();
    } finally {
      setIsCheckingOut(false); // End loading
    }
  };

  const startRedirectCountdown = () => {
    let seconds = 3;
    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        setErrorRedirect(
          `Something went wrong. Redirecting to home in ${seconds}...`
        );
      } else {
        clearInterval(interval);
        router.push("/");
      }
    }, 1000);
  };

  if (loading)
    return <div className="p-10 text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-xl shadow-xl border-0">
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
              <span>$1.99</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-600 mb-2">
                <span>Promo Applied (FREEDOMAIN)</span>
                <span>-$1.99</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
              <span>Total</span>
              <span>{discountApplied ? "$0.00" : "$1.99"}</span>
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
            <Button type="button" onClick={handlePromoApply}>
              Apply
            </Button>
          </div>

          <Button
            className="hover:cursor-pointer mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleCheckout}
            disabled={discountApplied === false || isCheckingOut}
          >
            {isCheckingOut ? (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validating Payment...</span>
              </div>
            ) : discountApplied ? (
              "Complete Checkout"
            ) : (
              "Apply Promo Code to Continue"
            )}
          </Button>

          {errorRedirect && (
            <p className="mt-4 rounded-xl text-center bg-red-600/70 py-2 px-3 text-white font-bold">
              {errorRedirect}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

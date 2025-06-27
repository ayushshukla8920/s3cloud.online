"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function HeaderClient() {
  const [userEmail, setUserEmail] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

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
          localStorage.removeItem("token");
        }
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div>
      {userEmail ? (
        <div className="relative" ref={dropdownRef}>
          <button
            className="hover:cursor-pointer flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-black focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="truncate max-w-[120px]">Hi, {userEmail}</span>
            <ChevronDown className="w-6 h-6" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hover:cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link href="/login">
            <Button
              className="hover:cursor-pointer border-[0.5px] border-black"
              variant="ghost"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="hover:cursor-pointer">Sign Up</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

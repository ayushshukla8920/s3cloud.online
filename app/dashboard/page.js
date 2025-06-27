"use client";
import { useEffect, useState } from "react";
import { Globe, Plus, Settings, LogOut, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [domains, setDomains] = useState([]);
  const [editingDomain, setEditingDomain] = useState(null);
  const [newARecord, setNewARecord] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingDomains, setLoadingDomains] = useState(true);

  const isValidIP = (ip) => {
    const ipRegex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.email) {
          router.push("/login");
        } else {
          setUserEmail(data.email);
          loadDomains(token);
        }
      });
  }, []);

  const loadDomains = async (token) => {
    setLoadingDomains(true);
    try {
      const res = await fetch("/api/my-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwt: token }),
      });

      const data = await res.json();
      if (res.ok) {
        setDomains(data.domains || []);
      }
    } catch (err) {
      console.error("Failed to load domains:", err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleEditARecord = (domain) => {
    setEditingDomain(domain.id);
    setNewARecord(domain.aRecord);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push('/');
  };

  const handleSaveARecord = async (domainId) => {
    if (!isValidIP(newARecord)) {
      alert("Please enter a valid IP address.");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const domain = domains.find((d) => d.id === domainId);
      console.log(domain);
      const res = await fetch("/api/update-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: token,
          alias: domain.subdomain,
          ipaddr: newARecord,
          record_id: domain.recordId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.err || "Failed to update A record.");
      } else {
        setSuccessMsg("Record updated successfully!");
        setTimeout(() => setSuccessMsg(""), 10000);
        loadDomains(token);
      }
    } catch (err) {
      alert("Something went wrong.");
    }

    setIsSaving(false);
    setEditingDomain(null);
    setNewARecord("");
  };

  const handleCancelEdit = () => {
    setEditingDomain(null);
    setNewARecord("");
  };
  if (loadingDomains) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <img src="/S3.png" className="h-40 w-60 mb-10 opacity-70" />
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-blue-700 font-medium text-xl">
            Loading domains...
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-5 py-4 flex flex-wrap justify-between items-center gap-4">
        <div onClick={()=>{router.push('/')}} className="hover:cursor-pointer flex items-center space-x-2">
          <img src="/S3.png" className="h-10 w-15" />
          <span className="text-2xl font-bold text-gray-900">
            S3Cloud Domains
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 truncate max-w-[140px]">
            Welcome, {userEmail}
          </span>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="hover:cursor-pointer">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Domains
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Manage your registered subdomains and DNS settings
            </p>
          </div>
          <Link href="/">
            <Button className="hover:cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Register New Domain
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-gray-600">Total Domains</p>
              <p className="text-2xl font-bold text-gray-900">
                {domains.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {domains.filter((d) => d.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {
                  domains.filter(
                    (d) =>
                      new Date(d.createdAt).getMonth() === new Date().getMonth()
                  ).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Domain List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Domains</CardTitle>
            <CardDescription>
              Click edit to change DNS A record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMsg && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm font-medium">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {domain.subdomain}
                      </h3>
                      <Badge
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        variant={
                          domain.status === "active" ? "default" : "secondary"
                        }
                      >
                        {domain.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Created on{" "}
                      {new Date(domain.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Label className="text-sm font-medium text-gray-600">
                        A Record:
                      </Label>
                      {editingDomain === domain.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            value={newARecord ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^[0-9.]*$/.test(value)) {
                                setNewARecord(value);
                              }
                            }}
                            placeholder="Enter IP"
                            className="w-48"
                          />

                          <Button
                            size="sm"
                            onClick={() => handleSaveARecord(domain.id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:cursor-pointer"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="hover:cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {domain.ip || "0.0.0.0"}
                          </span>
                          <Button
                            className="hover:cursor-pointer"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditARecord(domain)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {domains.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No domains found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven't registered any domains yet.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Your Free Domain
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

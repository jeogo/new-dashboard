// src/components/DashboardLayout.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      {/* Dashboard Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={() => router.push("/settings")}
        >
          Settings
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
          <nav className="space-y-4">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-700 px-4 py-2 rounded text-left hover:bg-gray-600 transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/products")}
              className="w-full bg-gray-700 px-4 py-2 rounded text-left hover:bg-gray-600 transition"
            >
              Products
            </button>
            <button
              onClick={() => router.push("/users")}
              className="w-full bg-gray-700 px-4 py-2 rounded text-left hover:bg-gray-600 transition"
            >
              Users
            </button>
            <button
              onClick={() => router.push("/categories")}
              className="w-full bg-gray-700 px-4 py-2 rounded text-left hover:bg-gray-600 transition"
            >
              Categories
            </button>
            <button
              onClick={() => router.push("/notification")}
              className="w-full bg-gray-700 px-4 py-2 rounded text-left hover:bg-gray-600 transition"
            >
              Notification
            </button>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

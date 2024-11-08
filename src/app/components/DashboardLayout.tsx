"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiList,
  FiBell,
  FiSettings,
  FiMenu,
} from "react-icons/fi";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const navigationItems = [
    { name: "Dashboard", icon: <FiHome className="w-5 h-5" />, path: "/" },
    {
      name: "Products",
      icon: <FiBox className="w-5 h-5" />,
      path: "/products",
    },
    { name: "Users", icon: <FiUsers className="w-5 h-5" />, path: "/users" },
    {
      name: "Categories",
      icon: <FiList className="w-5 h-5" />,
      path: "/categories",
    },
    {
      name: "Notifications",
      icon: <FiBell className="w-5 h-5" />,
      path: "/notification",
    },
    {
      name: "Settings",
      icon: <FiSettings className="w-5 h-5" />,
      path: "/settings",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out 
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
          bg-white border-r border-gray-200 shadow-lg md:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-semibold text-gray-800">
              Dashboard
            </span>
            <button
              className="p-2 rounded-lg md:hidden hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-6">
            <button
              className="p-2 rounded-lg md:hidden hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <FiBell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

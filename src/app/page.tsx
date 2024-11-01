// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "./utils/apiClient"; // Import the API client
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement, // Add PointElement for Line charts
  LineElement, // Add LineElement for Line charts
  Title,
  Tooltip,
  Legend,
  ArcElement, // Add ArcElement for Doughnut and Pie charts
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Home() {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await apiClient.get("/products");
        setTotalProducts(products.length);
        console.log("Fetched products:", products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await apiClient.get("/users");
        setTotalUsers(users.length);
        console.log("Fetched users:", users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categories = await apiClient.get("/categories");
        setTotalCategories(categories.length);
        console.log("Fetched categories:", categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchUsers();
    fetchCategories();
  }, []);

  // Chart Data
  const productData = {
    labels: ["Products"],
    datasets: [
      {
        label: "Total Products",
        data: [totalProducts || 0],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const userData = {
    labels: ["Users"],
    datasets: [
      {
        label: "Total Users",
        data: [totalUsers || 0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const categoryData = {
    labels: ["Categories"],
    datasets: [
      {
        label: "Total Categories",
        data: [totalCategories || 0],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const salesData = {
    labels: ["Products", "Users", "Categories"],
    datasets: [
      {
        label: "Data Overview",
        data: [totalProducts || 0, totalUsers || 0, totalCategories || 0],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Total Products</h2>
          <p className="text-4xl font-bold text-blue-600">
            {totalProducts ?? "Loading..."}
          </p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            View Products
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Total Users</h2>
          <p className="text-4xl font-bold text-green-600">
            {totalUsers ?? "Loading..."}
          </p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
            View Users
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Total Categories</h2>
          <p className="text-4xl font-bold text-purple-600">
            {totalCategories ?? "Loading..."}
          </p>
          <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition">
            View Categories
          </button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-200 p-4 rounded-md text-gray-700 h-64">
            <Bar
              data={productData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
          <div className="bg-gray-200 p-4 rounded-md text-gray-700 h-64">
            <Doughnut
              data={userData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
          <div className="bg-gray-200 p-4 rounded-md text-gray-700 h-64">
            <Line
              data={categoryData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
          <div className="bg-gray-200 p-4 rounded-md text-gray-700 h-64">
            <Pie
              data={salesData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

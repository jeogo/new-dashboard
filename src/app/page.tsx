"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "./utils/apiClient";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { FiTrendingUp, FiUsers, FiBox, FiList } from "react-icons/fi";

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

const StatCard = ({ title, value, icon, color, onClick }: any) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {value ?? <span className="text-gray-400 text-2xl">Loading...</span>}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await apiClient.get("/products");
        setTotalProducts(products.length);
        const users = await apiClient.get("/users");
        setTotalUsers(users.length);
        const categories = await apiClient.get("/categories");
        setTotalCategories(categories.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Products",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
      {
        label: "Users",
        data: [28, 48, 40, 19, 86, 27],
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14, 165, 233, 0.5)",
      },
    ],
  };

  const doughnutData = {
    labels: ["Products", "Users", "Categories"],
    datasets: [
      {
        data: [totalProducts || 0, totalUsers || 0, totalCategories || 0],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard Overview
        </h1>
        <button className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <FiTrendingUp className="mr-2" />
          View Reports
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<FiBox className="w-6 h-6 text-indigo-600" />}
          color="bg-indigo-100"
          onClick={() => router.push("/products")}
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<FiUsers className="w-6 h-6 text-sky-600" />}
          color="bg-sky-100"
          onClick={() => router.push("/users")}
        />
        <StatCard
          title="Total Categories"
          value={totalCategories}
          icon={<FiList className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          onClick={() => router.push("/categories")}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Growth Overview
          </h3>
          <div className="h-80">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribution
          </h3>
          <div className="h-80">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
[];

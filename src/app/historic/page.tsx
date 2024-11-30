"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface User {
  _id: string;
  telegramId: string;
  username: string;
  fullName?: string;
} 

interface HistoricEntry {
  _id: string;
  entity: string;
  entityId: string | null;
  action: string;
  timestamp: string;
  performedBy: {
    type: string;
    id: string | null;
  };
  details: string;
  metadata?: Record<string, any>;
}

const HistoricPage: React.FC = () => {
  const [historicEntries, setHistoricEntries] = useState<HistoricEntry[]>([]);
  const [userData, setUserData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all"); // Active section tracker

  const categories = [
    "all",
    "notification",
    "user",
    "product",
    "category",
    "preorder",
    "purchase",
  ];

  const filteredEntries =
    activeTab === "all"
      ? historicEntries
      : historicEntries.filter(
          (entry) => entry.entity.toLowerCase() === activeTab
        );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch historic data
      const [historicResponse, userResponse] = await Promise.all([
        apiClient.get("/historic"),
        apiClient.get("/users"),
      ]);

      setHistoricEntries(historicResponse);
      setUserData(userResponse);
    } catch (err: any) {
      setError("Error fetching data. Please try again later.");
      console.error("Error fetching data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId: string | null): string => {
    if (!userId) return "Unknown User";
    const user = userData.find((user) => user._id === userId);
    return user?.fullName || user?.username || "Unknown User";
  };

  const renderTable = (entries: HistoricEntry[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-4 border-b">Entity</th>
            <th className="text-left p-4 border-b">Action</th>
            <th className="text-left p-4 border-b">Performed By</th>
            <th className="text-left p-4 border-b">Details</th>
            <th className="text-left p-4 border-b">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No records found for this section.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry._id} className="hover:bg-gray-50">
                <td className="p-4 border-b">{entry.entity}</td>
                <td className="p-4 border-b">{entry.action}</td>
                <td className="p-4 border-b capitalize">
                  {getUserName(entry.performedBy.id)}
                </td>
                <td className="p-4 border-b">{entry.details}</td>
                <td className="p-4 border-b">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Historic Records</h1>

      {isLoading ? (
        <p>Loading historic records...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Tabs for categories */}
          <div className="flex flex-wrap gap-4 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-lg text-white ${
                  activeTab === category
                    ? "bg-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Render active tab */}
          {activeTab === "purchase" && (
            <div className="mb-4">
              <p className="text-lg font-medium">
                Total Purchases: {filteredEntries.length}
              </p>
            </div>
          )}

          <div>{renderTable(filteredEntries)}</div>
        </>
      )}
    </div>
  );
};

export default HistoricPage;

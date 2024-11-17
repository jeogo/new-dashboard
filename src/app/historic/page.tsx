"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

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

export default function HistoricPage() {
  const [historicEntries, setHistoricEntries] = useState<HistoricEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<HistoricEntry[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    entity: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch historic entries
  useEffect(() => {
    fetchHistoricEntries();
  }, []);

  const fetchHistoricEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/historic");
      setHistoricEntries(response);
      setFilteredEntries(response);
    } catch (err: any) {
      setError("Error fetching historic entries. Please try again later.");
      console.error("Error fetching historic entries:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    const filtered = historicEntries.filter(
      (entry) =>
        entry.details.toLowerCase().includes(filters.search.toLowerCase()) &&
        entry.action.toLowerCase().includes(filters.action.toLowerCase()) &&
        entry.entity.toLowerCase().includes(filters.entity.toLowerCase())
    );
    setFilteredEntries(filtered);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Historic Records</h1>

      {isLoading ? (
        <p>Loading historic records...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by details..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by action..."
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by entity..."
              value={filters.entity}
              onChange={(e) => handleFilterChange("entity", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Responsive Table */}
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
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No historic records match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="p-4 border-b">{entry.entity}</td>
                      <td className="p-4 border-b">{entry.action}</td>
                      <td className="p-4 border-b capitalize">
                        {entry.performedBy.type} (ID: {entry.performedBy.id})
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
        </>
      )}
    </div>
  );
}

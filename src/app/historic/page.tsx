"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface ClientHistoryEntry {
  action: "purchase" | "preorder" | "preOrder";
  date: Date;
  userId: string;
  fullName: string;
  email?: string;
  productId: string;
  productName: string;
  price: number;
  status?: string;
  message?: string;
  responseMessage?: string;
  fulfillmentDate?: Date;
}

interface AdminHistoryEntry {
  action: "create" | "update" | "delete" | "Recharge" | "Discount";
  date: Date;
  adminId?: string;
  entity?:
    | "product"
    | "user"
    | "category"
    | "preorder"
    | "notification"
    | "balance"
    | "system";
  entityId?: string;
  entityName?: string;
  updatedFields?: Record<string, any>;
  details?: string;
  target?: string;
  targetId?: string;
  userId?: string;
  fullName?: string;
  phoneNumber?: string;
  message?: string;
  previousBalance?: number;
  newBalance?: number;
}

interface History {
  _id: string;
  type?: "client" | "admin";
  entry: ClientHistoryEntry | AdminHistoryEntry;
  actionType?:
    | "purchase"
    | "preOrder"
    | "preorder"
    | "update"
    | "Recharge"
    | "Discount";
  description?: string;
  productId?: string;
  productName?: string;
  price?: number;
  categoryName?: string;
  fullName?: string;
  phoneNumber?: string;
  emailSold?: string;
  userMessage?: string;
  status?: string;
  responseMessage?: string;
  fulfillmentDate?: Date;
}

type ActionFilter = "all" | "client" | "admin";

const HistoryDashboard = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [actionFilter, searchTerm, history]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/historic");

      if (response && Array.isArray(response.data)) {
        const formattedHistory = response.data.map((record: any) => {
          if (
            record.actionType === "purchase" ||
            record.actionType === "preOrder" ||
            record.actionType === "preorder"
          ) {
            return {
              _id: record._id,
              type: "client",
              entry: {
                action: record.actionType,
                date: new Date(record.date),
                userId: record.userId,
                fullName: record.fullName || "Unknown User",
                productId: record.productId,
                productName: record.productName,
                price: record.price,
                status:
                  record.status ||
                  (record.actionType === "purchase" ? "completed" : "pending"),
                message: record.description,
                responseMessage: record.responseMessage,
                fulfillmentDate: record.fulfillmentDate
                  ? new Date(record.fulfillmentDate)
                  : undefined,
              },
            };
          } else {
            return {
              _id: record._id,
              type: "admin",
              entry: {
                action: record.action,
                date: new Date(record.date),
                adminId: record.userId || "system",
                entity: record.target || "system",
                entityId: record.targetId || "",
                entityName:
                  record.target === "balance"
                    ? "Balance Update"
                    : "System Update",
                details:
                  record.message ||
                  record.description ||
                  `${record.action} operation performed`,
                updatedFields: record.updatedFields,
                userId: record.userId,
                fullName: record.fullName,
                phoneNumber: record.phoneNumber,
                previousBalance: record.previousBalance,
                newBalance: record.newBalance,
              },
            };
          }
        });

        // Sort the history by date in descending order
        formattedHistory.sort(
          (a: { entry: { date: string | number | Date; }; }, b: { entry: { date: string | number | Date; }; }) =>
            new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime()
        );

        setHistory(formattedHistory);
        setFilteredHistory(formattedHistory);
      } else {
        setHistory([]);
        setFilteredHistory([]);
        console.error("Unexpected response format:", response);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history records. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history.filter((record) => {
      if (actionFilter === "all") return true;
      return record.type === actionFilter;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        const entry = record.entry;
        return (
          ("fullName" in entry &&
            entry.fullName?.toLowerCase().includes(searchLower)) ||
          ("email" in entry &&
            entry.email?.toLowerCase().includes(searchLower)) ||
          ("productName" in entry &&
            entry.productName?.toLowerCase().includes(searchLower)) ||
          ("entityName" in entry &&
            entry.entityName?.toLowerCase().includes(searchLower)) ||
          ("details" in entry &&
            entry.details?.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredHistory(filtered);
  };

  const renderClientEntry = (entry: ClientHistoryEntry) => (
    <tr className="hover:bg-gray-50">
      <td className="p-4 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            entry.action === "purchase"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {entry.action === "purchase" ? "Purchase" : "Preorder"}
        </span>
      </td>
      <td className="p-4 text-sm">{entry.fullName}</td>
      <td className="p-4 text-sm">{entry.productName}</td>
      <td className="p-4 text-sm">${entry.price.toFixed(2)}</td>
      <td className="p-4 text-sm">{new Date(entry.date).toLocaleString()}</td>
      {entry.action === "purchase" ? (
        <td className="p-4 text-sm">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Completed
          </span>
        </td>
      ) : (
        <td className="p-4 text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              entry.status === "fulfilled"
                ? "bg-green-100 text-green-800"
                : entry.status === "canceled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {entry.status || "Pending"}
          </span>
        </td>
      )}
    </tr>
  );

  const renderAdminEntry = (entry: AdminHistoryEntry) => (
    <tr className="hover:bg-gray-50">
      <td className="p-4 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            entry.action === "update"
              ? "bg-yellow-100 text-yellow-800"
              : entry.action === "Recharge"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {entry.action}
        </span>
      </td>
      <td className="p-4 text-sm">{entry.fullName || "System"}</td>
      <td className="p-4 text-sm">
        {entry.entityName || entry.entity || "System Update"}
      </td>
      <td className="p-4 text-sm">{new Date(entry.date).toLocaleString()}</td>
      <td className="p-4 text-sm">
        {entry.action === "Recharge" || entry.action === "Discount" ? (
          <>
            {entry.action === "Recharge" ? "Recharged" : "Discounted"} balance
            by $
            {Math.abs(
              (entry.newBalance || 0) - (entry.previousBalance || 0)
            ).toFixed(2)}
          </>
        ) : (
          entry.details || `${entry.action} operation performed`
        )}
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">History Dashboard</h1>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, product, or entity..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
          className="p-2 border rounded-md w-full md:w-48"
        >
          <option value="all">All Records</option>
          <option value="client">Client Actions</option>
          <option value="admin">Admin Actions</option>
        </select>
      </div>

      {error ? (
        <div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                {actionFilter !== "admin" && (
                  <>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </>
                )}
                {actionFilter !== "client" && (
                  <>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                  </>
                )}
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {actionFilter === "admin" ? "Details" : "Status"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((record) => (
                <React.Fragment key={record._id}>
                  {record.type === "client"
                    ? renderClientEntry(record.entry as ClientHistoryEntry)
                    : renderAdminEntry(record.entry as AdminHistoryEntry)}
                </React.Fragment>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={actionFilter === "admin" ? 6 : 7}
                    className="p-4 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryDashboard;

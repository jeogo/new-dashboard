"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { apiClient } from "../utils/apiClient";

// Types definitions
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
}

type ActionFilter = "all" | "client" | "admin";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

const HistoryDashboard = () => {
  // State management
  const [history, setHistory] = useState<History[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [isMobileView, setIsMobileView] = useState(false);

  // Effect for handling responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect for fetching data
  useEffect(() => {
    fetchHistory();
  }, []);

  // Effect for filtering and sorting
  useEffect(() => {
    filterAndSortHistory();
  }, [actionFilter, searchTerm, history, sortDirection, dateRange]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/historic");

      if (response && Array.isArray(response.data)) {
        const formattedHistory = response.data.map((record: any) => ({
          _id: record._id,
          type:
            record.actionType === "purchase" ||
            record.actionType === "preOrder" ||
            record.actionType === "preorder"
              ? "client"
              : "admin",
          entry:
            record.actionType === "purchase" ||
            record.actionType === "preOrder" ||
            record.actionType === "preorder"
              ? {
                  action: record.actionType,
                  date: new Date(record.date),
                  userId: record.userId,
                  fullName: record.fullName || "Unknown User",
                  productId: record.productId,
                  productName: record.productName,
                  price: record.price,
                  status:
                    record.status ||
                    (record.actionType === "purchase"
                      ? "completed"
                      : "pending"),
                  message: record.description,
                  responseMessage: record.responseMessage,
                  fulfillmentDate: record.fulfillmentDate
                    ? new Date(record.fulfillmentDate)
                    : undefined,
                }
              : {
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
        }));

        setHistory(formattedHistory);
      } else {
        setHistory([]);
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

  const filterAndSortHistory = () => {
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

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.entry.date);
        const startDate = dateRange.start
          ? new Date(dateRange.start)
          : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.entry.date).getTime();
      const dateB = new Date(b.entry.date).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredHistory(filtered);
    setCurrentPage(1);
  };

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  const renderClientEntry = (entry: ClientHistoryEntry) => (
    <div className="md:hidden mb-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            entry.action === "purchase"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {entry.action === "purchase" ? "Purchase" : "Preorder"}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            entry.status === "completed" || entry.action === "purchase"
              ? "bg-green-100 text-green-800"
              : entry.status === "canceled"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {entry.status ||
            (entry.action === "purchase" ? "Completed" : "Pending")}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">{entry.fullName}</p>
        <p className="text-sm text-gray-600">{entry.productName}</p>
        <p className="text-sm font-medium text-gray-900">
          ${entry.price.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(entry.date).toLocaleString()}
        </p>
      </div>
    </div>
  );

  const renderAdminEntry = (entry: AdminHistoryEntry) => (
    <div className="md:hidden mb-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            entry.action === "update"
              ? "bg-yellow-100 text-yellow-800"
              : entry.action === "Recharge"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {entry.action}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">
          {entry.fullName || "System"}
        </p>
        <p className="text-sm text-gray-600">
          {entry.entityName || entry.entity || "System Update"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(entry.date).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
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
        </p>
      </div>
    </div>
  );

  const renderTableRow = (record: History) => {
    const isClientEntry = record.type === "client";
    const entry = record.entry;

    return [
      <td key="action" className="p-4 text-sm">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isClientEntry
              ? entry.action === "purchase"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
              : entry.action === "update"
              ? "bg-yellow-100 text-yellow-800"
              : entry.action === "Recharge"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {isClientEntry
            ? (entry as ClientHistoryEntry).action === "purchase"
              ? "Purchase"
              : "Preorder"
            : (entry as AdminHistoryEntry).action}
        </span>
      </td>,
      <td key="name" className="p-4 text-sm">
        {entry.fullName || "System"}
      </td>,
      <td key="product-entity" className="p-4 text-sm">
        {isClientEntry
          ? (entry as ClientHistoryEntry).productName
          : (entry as AdminHistoryEntry).entityName || "System Update"}
      </td>,
      <td key="amount-details" className="p-4 text-sm">
        {isClientEntry
          ? `$${(entry as ClientHistoryEntry).price.toFixed(2)}`
          : (entry as AdminHistoryEntry).details || "System operation"}
      </td>,
      <td key="date" className="p-4 text-sm">
        {new Date(entry.date).toLocaleString()}
      </td>,
      <td key="status" className="p-4 text-sm">
        {isClientEntry ? (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              (entry as ClientHistoryEntry).status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {(entry as ClientHistoryEntry).status || "Pending"}
          </span>
        ) : (
          (entry as AdminHistoryEntry).details || "System Update"
        )}
      </td>,
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          History Dashboard
        </h1>
        <button
          onClick={() =>
            setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          className="inline-flex items-center px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
        >
          {sortDirection === "desc" ? (
            <SortDesc className="w-4 h-4 mr-2" />
          ) : (
            <SortAsc className="w-4 h-4 mr-2" />
          )}
          {sortDirection === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <input
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              placeholder="Start date"
            />
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              placeholder="End date"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Records</option>
              <option value="client">Client Actions</option>
              <option value="admin">Admin Actions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden">
          {paginatedHistory.map((record) => (
            <div key={record._id}>
              {record.type === "client"
                ? renderClientEntry(record.entry as ClientHistoryEntry)
                : renderAdminEntry(record.entry as AdminHistoryEntry)}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {actionFilter === "admin" ? "Entity" : "Product"}
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {actionFilter === "admin" ? "Details" : "Amount"}
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedHistory.map((record) => (
                <tr
                  key={record._id}
                  className="hidden md:table-row hover:bg-gray-50"
                >
                  {renderTableRow(record)}
                </tr>
              ))}
              {paginatedHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredHistory.length > 0 && (
          <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
            {/* Mobile Pagination */}
            <div className="flex justify-between w-full sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      filteredHistory.length
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredHistory.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredHistory.length}</span>{" "}
                  results
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">First</span>
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Last</span>
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDashboard;

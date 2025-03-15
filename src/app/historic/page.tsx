"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  ArrowRight,
  DollarSign,
  ToggleLeft,
  Calendar,
  Mail,
  Tag,
  Package,
  Folder,
  User,
  CreditCard,
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
  emailSold?: string;
}

interface UpdateField {
  old?: string | number | boolean;
  new?: string | number | boolean;
  added?: string[];
  removed?: string[];
}

interface UpdatedFields {
  [key: string]: UpdateField;
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
  updatedFields?: UpdatedFields;
  details?: string;
  target?: string;
  targetId?: string;
  userId?: string;
  fullName?: string;
  phoneNumber?: string;
  message?: string;
  previousBalance?: number;
  newBalance?: number;
  productDetails?: {
    productName: string;
    categoryName: string;
  };
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

type ActionFilter =
  | "all"
  | "purchase"
  | "preorder"
  | "recharge-discount"
  | "update";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

// Utility functions
const formatFieldName = (field: string): string => {
  return field
    .split(/(?=[A-Z])|_/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatBoolean = (value: boolean): string => {
  return value ? "Available" : "Not Available";
};

const getFieldProperties = (
  fieldName: string
): {
  icon: React.ReactNode;
  colorClass: string;
} => {
  const properties = {
    price: {
      icon: <DollarSign className="w-4 h-4" />,
      colorClass: "text-green-600",
    },
    isAvailable: {
      icon: <ToggleLeft className="w-4 h-4" />,
      colorClass: "text-blue-600",
    },
    allowPreOrder: {
      icon: <Calendar className="w-4 h-4" />,
      colorClass: "text-purple-600",
    },
    emails: {
      icon: <Mail className="w-4 h-4" />,
      colorClass: "text-orange-600",
    },
    name: {
      icon: <Tag className="w-4 h-4" />,
      colorClass: "text-gray-600",
    },
    default: {
      icon: <Package className="w-4 h-4" />,
      colorClass: "text-gray-600",
    },
  };

  const key =
    Object.keys(properties).find((k) =>
      fieldName.toLowerCase().includes(k.toLowerCase())
    ) || "default";

  return properties[key as keyof typeof properties];
};

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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

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
                  emailSold: record.emailSold,
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
                  productDetails: record.productDetails,
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

      // Handle preorder filter (only "preorder", case-sensitive)
      if (actionFilter === "preorder") {
        return (
          record.type === "client" &&
          (record.entry as ClientHistoryEntry).action === "preorder"
        );
      }

      // Handle purchase filter
      if (actionFilter === "purchase") {
        return (
          record.type === "client" &&
          (record.entry as ClientHistoryEntry).action === "purchase"
        );
      }

      // Handle recharge-discount filter
      if (actionFilter === "recharge-discount") {
        return (
          record.type === "admin" &&
          ((record.entry as AdminHistoryEntry).action === "Recharge" ||
            (record.entry as AdminHistoryEntry).action === "Discount")
        );
      }

      // Handle update filter
      if (actionFilter === "update") {
        return (
          record.type === "admin" &&
          (record.entry as AdminHistoryEntry).action === "update"
        );
      }

      return false;
    });

    // Apply search term filter
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

    // Apply date range filter
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

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.entry.date).getTime();
      const dateB = new Date(b.entry.date).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredHistory(filtered);
    setCurrentPage(1);
  };
  const renderUpdateFields = (
    updatedFields: UpdatedFields,
    productDetails?: AdminHistoryEntry["productDetails"]
  ) => {
    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {productDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-gray-600" />
              <span className="font-medium">
                {productDetails.productName || "Unknown Product"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Folder className="w-4 h-4" />
              <span>{productDetails.categoryName || "Unknown Category"}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Object.entries(updatedFields).map(([field, value]) => {
            if (!value || typeof value !== "object") return null;

            const { icon, colorClass } = getFieldProperties(field);
            const fieldName = formatFieldName(field);

            return (
              <div key={field} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={colorClass}>{icon}</span>
                  <span className="font-medium text-gray-900">{fieldName}</span>
                </div>

                <div className="pl-6 space-y-2">
                  {/* Prices and Status (Old and New) */}
                  {(field === "price" || field === "status") && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">
                        {typeof value.old === "boolean"
                          ? formatBoolean(value.old)
                          : value.old}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {typeof value.new === "boolean"
                          ? formatBoolean(value.new)
                          : value.new}
                      </span>
                    </div>
                  )}

                  {/* Emails (Added and Removed) */}
                  {field === "emails" && (
                    <>
                      {value.added && value.added.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600 font-medium">
                            Added Emails:{" "}
                          </span>
                          <ul className="list-disc pl-6">
                            {value.added.map((email, index) => (
                              <li key={index} className="text-green-700">
                                {email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {value.removed && value.removed.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="text-red-600 font-medium">
                            Removed Emails:{" "}
                          </span>
                          <ul className="list-disc pl-6">
                            {value.removed.map((email, index) => (
                              <li key={index} className="text-red-700">
                                {email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  const renderHistoryCards = () => {
    return paginatedHistory.map((record) => {
      const entry = record.entry;
      const isClientEntry = record.type === "client";
      const isExpanded = expandedCardId === record._id;

      return (
        <div
          key={record._id}
          className="bg-white p-4 rounded-lg shadow-sm mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => setExpandedCardId(isExpanded ? null : record._id)}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
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
                ? entry.action === "purchase"
                  ? "Purchase"
                  : "Preorder"
                : entry.action}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(entry.date).toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {entry.fullName || "System"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isClientEntry
                  ? (entry as ClientHistoryEntry).productName
                  : (entry as AdminHistoryEntry).entityName || "System Update"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isClientEntry
                  ? `$${(entry as ClientHistoryEntry).price.toFixed(2)}`
                  : (entry as AdminHistoryEntry).details || "System operation"}
              </p>
            </div>
            {isClientEntry && (
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      (entry as ClientHistoryEntry).status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {(entry as ClientHistoryEntry).status || "Pending"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Expanded Section */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              {isClientEntry ? (
                <>
                  {(entry as ClientHistoryEntry).emailSold && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Email Sold:{" "}
                        <span className="font-medium">
                          {(entry as ClientHistoryEntry).emailSold}
                        </span>
                      </p>
                    </div>
                  )}
                  {(entry as ClientHistoryEntry).message && (
                    <div className="flex items-start space-x-2">
                      <Tag className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-sm text-gray-600">
                        Message:{" "}
                        <span className="font-medium">
                          {(entry as ClientHistoryEntry).message}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {entry.action === "update" &&
                    renderUpdateFields(
                      (entry as AdminHistoryEntry).updatedFields || {},
                      (entry as AdminHistoryEntry).productDetails
                    )}
                  {entry.action === "Recharge" && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Previous Balance:{" "}
                          <span className="font-medium">
                            $
                            {(
                              entry as AdminHistoryEntry
                            ).previousBalance?.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          New Balance:{" "}
                          <span className="font-medium">
                            $
                            {(entry as AdminHistoryEntry).newBalance?.toFixed(
                              2
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          History Dashboard
        </h1>
        <button
          onClick={() =>
            setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
          }
          className="inline-flex items-center px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm transition-colors duration-200"
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
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Records</option>
              <option value="purchase">Purchases</option>
              <option value="recharge-discount">Recharge/Discount</option>
              <option value="update">Updates</option>
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

      {/* History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderHistoryCards()}
      </div>

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

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
                of <span className="font-medium">{filteredHistory.length}</span>{" "}
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

              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="hidden md:flex items-center space-x-2">
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
  );
};

export default HistoryDashboard;

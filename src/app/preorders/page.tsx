"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface PreOrder {
  _id: string;
  userId: string;
  productId: string;
  date: string;
  status: string;
  message: string;
  fulfillmentDate?: string;
  userName: string;
  userTelegramId: string;
  productName: string;
  productPrice: number;
  fullName?: string;
  clientMessage?: string;
  fulfillmentDetails?: string;
  clientMessageData?: string;
}

export default function PreOrdersPage() {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [filteredPreOrders, setFilteredPreOrders] = useState<PreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(
    null
  );
  const [action, setAction] = useState<"fulfilled" | "canceled" | null>(null);
  const [emailPassword, setEmailPassword] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Limit to 10 entries per page

  useEffect(() => {
    fetchPreOrders();
  }, []);

  useEffect(() => {
    // Filter and sort pre-orders
    let filtered = preOrders;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (preOrder) => preOrder.status === selectedStatus
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (preOrder) =>
          preOrder.productName.toLowerCase().includes(searchLower) ||
          (preOrder.fullName || preOrder.userName)
            .toLowerCase()
            .includes(searchLower)
      );
    }

    // Sort by date (newest to oldest)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setFilteredPreOrders(filtered);
    setCurrentPage(1); // Reset to the first page when filters change
  }, [selectedStatus, searchTerm, preOrders]);

  const fetchPreOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/preorders");
      setPreOrders(response);
    } catch (error: any) {
      setError("Error fetching pre-orders. Please try again later.");
      console.error("Error fetching pre-orders:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreOrderStatus = async (
    preOrderId: string,
    status: string,
    emailPassword?: string
  ) => {
    try {
      setError(null);
      await apiClient.put(`/preorders/${preOrderId}/status`, {
        status,
        emailPassword,
      });
      await fetchPreOrders();
    } catch (error: any) {
      setError(`Error updating pre-order status to ${status}.`);
      console.error(
        `Error updating pre-order status to ${status}:`,
        error.message
      );
    }
  };
  const handleActionConfirm = () => {
    if (selectedPreOrder && action) {
      if (action === "fulfilled" && !emailPassword) {
        setError("Email and password are required for fulfillment.");
        return;
      }
      updatePreOrderStatus(
        selectedPreOrder._id,
        action,
        action === "fulfilled" ? emailPassword : undefined
      );
      setSelectedPreOrder(null);
      setAction(null);
      setEmailPassword("");
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPreOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredPreOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Pre-Orders Management
          </h1>
          <button
            onClick={fetchPreOrders}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Refresh Orders
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by product or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedStatus === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus("pending")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedStatus("fulfilled")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedStatus === "fulfilled"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Fulfilled
            </button>
            <button
              onClick={() => setSelectedStatus("canceled")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedStatus === "canceled"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Canceled
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pre-orders found.
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {paginatedOrders.map((preOrder) => (
              <div
                key={preOrder._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Order Summary */}
                <div
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                  onClick={() => toggleOrderExpand(preOrder._id)}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {preOrder.productName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          preOrder.status
                        )}`}
                      >
                        {preOrder.status.charAt(0).toUpperCase() +
                          preOrder.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {preOrder.userTelegramId || preOrder.userName} ||{" "}
                      {new Date(preOrder.date).toLocaleString()}
                    </p>
                  </div>
                  {preOrder.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPreOrder(preOrder);
                          setAction("fulfilled");
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                      >
                        Fulfill
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPreOrder(preOrder);
                          setAction("canceled");
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Order Details */}
                {expandedOrders.has(preOrder._id) && (
                  <div className="p-6 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">
                        Order Details
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Full Name:</strong>{" "}
                          {preOrder.fullName || preOrder.userName || preOrder.userTelegramId}
                        </p>
                        <p>
                          <strong>Product Price:</strong> $
                          {preOrder.productPrice.toFixed(2)}
                        </p>
                        <p>
                          <strong>Order Date:</strong>{" "}
                          {new Date(preOrder.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">
                        Additional Information
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {preOrder.message && (
                          <p>
                            <strong>Message:</strong> {preOrder.message}
                          </p>
                        )}
                        {preOrder.clientMessage && (
                          <p>
                            <strong>Client Message:</strong>{" "}
                            {preOrder.clientMessage}
                          </p>
                        )}
                        {preOrder.clientMessageData && (
                          <p>
                            <strong>Client Message Data:</strong>{" "}
                            {preOrder.clientMessageData}
                          </p>
                        )}
                        {preOrder.fulfillmentDate && (
                          <p>
                            <strong>Fulfillment Date:</strong>{" "}
                            {new Date(
                              preOrder.fulfillmentDate
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {selectedPreOrder && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {action === "fulfilled"
                  ? "Confirm Fulfillment"
                  : "Confirm Cancellation"}
              </h2>
              <p className="mb-4">
                Are you sure you want to{" "}
                <span className="font-bold">
                  {action === "fulfilled" ? "fulfill" : "cancel"}
                </span>{" "}
                this pre-order for{" "}
                <span className="font-bold">
                  {selectedPreOrder.productName}
                </span>
                ?
              </p>
              {action === "fulfilled" && (
                <textarea
                  placeholder="Enter email and password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full border rounded p-2 mb-4"
                  rows={3}
                />
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedPreOrder(null);
                    setAction(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

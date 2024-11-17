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
}

export default function PreOrdersPage() {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(
    null
  );
  const [action, setAction] = useState<"fulfilled" | "canceled" | null>(null);
  const [emailPassword, setEmailPassword] = useState<string>("");

  useEffect(() => {
    fetchPreOrders();
  }, []);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Pre-Orders</h1>

      {isLoading ? (
        <p>Loading pre-orders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : preOrders.length === 0 ? (
        <p>No pre-orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 border-b">User</th>
                <th className="text-left p-4 border-b">Product</th>
                <th className="text-left p-4 border-b">Order Date</th>
                <th className="text-left p-4 border-b">Status</th>
                <th className="text-left p-4 border-b">Message</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {preOrders.map((preOrder) => (
                <tr key={preOrder._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{preOrder.userName}</td>
                  <td className="p-4 border-b">{preOrder.productName}</td>
                  <td className="p-4 border-b">
                    {new Date(preOrder.date).toLocaleString()}
                  </td>
                  <td className="p-4 border-b capitalize">{preOrder.status}</td>
                  <td className="p-4 border-b">{preOrder.message}</td>
                  <td className="p-4 border-b space-x-2">
                    {preOrder.status === "pending" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedPreOrder(preOrder);
                            setAction("fulfilled");
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          Fulfill
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPreOrder(preOrder);
                            setAction("canceled");
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No Actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPreOrder && action && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {action === "fulfilled"
                ? `Confirm Fulfillment`
                : `Confirm Cancellation`}
            </h2>
            <p>
              Are you sure you want to{" "}
              <span className="font-bold">
                {action === "fulfilled" ? "fulfill" : "cancel"}
              </span>{" "}
              this pre-order for{" "}
              <span className="font-bold">{selectedPreOrder.productName}</span>?
            </p>
            {action === "fulfilled" && (
              <textarea
                placeholder="Enter email and password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full border rounded p-2 mt-4"
              />
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => {
                  setSelectedPreOrder(null);
                  setAction(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

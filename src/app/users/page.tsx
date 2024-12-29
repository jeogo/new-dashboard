"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import {
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
  FaSearch,
  FaHistory,
  FaPlusCircle,
  FaTrash,
  FaSort,
} from "react-icons/fa";

interface UserEvent {
  type: "recharge" | "status" | "delete" | "purchase";
  date: Date;
  amount?: number;
  status?: string;
  productId?: string;
  productName?: string;
  price?: number;
  emailSold?: string;
  categoryName?: string;
  adminAction?: "Recharge" | "Discount";
}

interface User {
  _id: string;
  telegramId: string;
  chatId: string;
  username: string;
  name: string;
  fullName?: string;
  phoneNumber?: string;
  balance: number;
  registerDate: Date;
  isAccepted: boolean;
  history?: UserEvent[];
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const DeleteConfirmationModal = ({
  title = "Confirm Delete",
  message,
  isOpen,
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  }>({ key: "registerDate", direction: "descending" });
  const [balanceInput, setBalanceInput] = useState("");
  const [balanceType, setBalanceType] = useState<"Recharge" | "Discount">(
    "Recharge"
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "accepted" | "pending"
  >("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((user) =>
        filterStatus === "accepted" ? user.isAccepted : !user.isAccepted
      );
    }

    // Apply search filter
 // Apply search filter
if (searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  result = result.filter((user) => {
    return (
      (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
      (user.name.toLowerCase().includes(searchLower)) ||
      (user.username.toLowerCase().includes(searchLower)) ||
      (user.telegramId && user.telegramId.includes(searchTerm)) || // Check if telegramId is defined
      (user.phoneNumber && user.phoneNumber.includes(searchTerm)) || // Check if phoneNumber is defined
      (user.chatId && user.chatId.includes(searchTerm)) // Check if chatId is defined
    );
  });
}

    // Apply sorting
    result.sort((a: any, b: any) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (valueA < valueB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortConfig, filterStatus]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");
      setUsers(response);
      setFilteredUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddBalance = async (amount: number) => {
    if (selectedUser && amount) {
      setIsUpdating(true);
      try {
        await apiClient.put(`/users/${selectedUser._id}/balance`, {
          amount,
          adminAction: balanceType,
        });
        await fetchUsers();
        setBalanceInput("");
        setShowAddBalanceModal(false);
      } catch (error) {
        console.error("Error updating balance:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await apiClient.delete(`/users/${userToDelete._id}`);
        await fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleUserAction = async (userId: string, isAccepted: boolean) => {
    setIsUpdating(true);
    try {
      await apiClient.put(`/users/${userId}`, { isAccepted });
      await fetchUsers();
    } catch (error) {
      console.error(
        `Error ${isAccepted ? "accepting" : "rejecting"} user:`,
        error
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSort = (key: keyof User) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Users</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("telegramId")}
                >
                  Telegram ID <FaSort className="inline ml-1" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("chatId")}
                >
                  Chat ID <FaSort className="inline ml-1" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("username")}
                >
                  Username <FaSort className="inline ml-1" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name <FaSort className="inline ml-1" />
                </th>
                <th className="p-4 text-left">Full Name</th>
                <th className="p-4 text-left">Phone Number</th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("balance")}
                >
                  Balance <FaSort className="inline ml-1" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("registerDate")}
                >
                  Register Date <FaSort className="inline ml-1" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort("isAccepted")}
                >
                  Status <FaSort className="inline ml-1" />
                </th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    <FaSpinner className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.telegramId}</td>
                    <td className="p-4">{user.chatId}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.fullName || "N/A"}</td>
                    <td className="p-4">{user.phoneNumber || "N/A"}</td>
                    <td className="p-4 text-green-600 font-semibold">
                      {user.balance} Units
                    </td>
                    <td className="p-4">
                      {new Date(user.registerDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isAccepted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isAccepted ? "Accepted" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {user.isAccepted ? (
                          <button
                            onClick={() => handleUserAction(user._id, false)}
                            className="text-yellow-500 hover:text-yellow-700"
                            title="Reject User"
                          >
                            <FaUserTimes />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user._id, true)}
                            className="text-green-500 hover:text-green-700"
                            title="Accept User"
                          >
                            <FaUserCheck />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowHistoryModal(true);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                          title="View History"
                        >
                          <FaHistory />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAddBalanceModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                          title="Add Balance"
                        >
                          <FaPlusCircle />
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Balance Modal */}
      {showAddBalanceModal && selectedUser && (
        <Modal
          title="Add Balance"
          onClose={() => setShowAddBalanceModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Select Action Type
              </label>
              <select
                value={balanceType}
                onChange={(e) =>
                  setBalanceType(e.target.value as "Recharge" | "Discount")
                }
                className="w-full p-2 border rounded"
              >
                <option value="Recharge">Recharge</option>
                <option value="Discount">Discount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Enter Amount (Units)
              </label>
              <input
                type="number"
                value={balanceInput.replace("-", "")} // Remove any negative sign
                onChange={(e) => {
                  const value = e.target.value;
                  // Store positive value but handle sign based on type
                  setBalanceInput(value.replace("-", "")); // Always store positive
                }}
                className="w-full p-2 border rounded"
                min="0"
                placeholder="Enter positive value"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Current Balance: {selectedUser.balance} Units
              </p>
              <p className="text-sm text-gray-600">
                New Balance:{" "}
                {selectedUser.balance +
                  (balanceType === "Discount"
                    ? -(parseInt(balanceInput) || 0)
                    : parseInt(balanceInput) || 0)}{" "}
                Units
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Convert to negative if it's a discount
                  const finalAmount =
                    balanceType === "Discount"
                      ? -parseInt(balanceInput)
                      : parseInt(balanceInput);
                  handleAddBalance(finalAmount);
                }}
                disabled={!balanceInput || isUpdating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `${
                    balanceType === "Discount"
                      ? "Apply Discount"
                      : "Add Balance"
                  }`
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* User History Modal */}
      {showHistoryModal && selectedUser && (
        <Modal
          title={`User History - ${
            selectedUser.fullName || selectedUser.username
          }`}
          onClose={() => setShowHistoryModal(false)}
        >
          <div className="space-y-4">
            {/* User Details Card */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Username:</span>{" "}
                  {selectedUser.username}
                </p>
                <p>
                  <span className="font-medium">Name:</span> {selectedUser.name}
                </p>
                <p>
                  <span className="font-medium">Current Balance:</span>{" "}
                  {selectedUser.balance} Units
                </p>
                <p>
                  <span className="font-medium">Register Date:</span>{" "}
                  {new Date(selectedUser.registerDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Date Filter Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 bg-white border rounded-lg">
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    setStartDate(today);
                    setEndDate(new Date());
                  }}
                  className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 3);
                    setStartDate(date);
                    setEndDate(new Date());
                  }}
                  className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
                >
                  Last 3 Days
                </button>
                <button
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 7);
                    setStartDate(date);
                    setEndDate(new Date());
                  }}
                  className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
                >
                  Last 7 Days
                </button>
              </div>

              {/* Custom Date Range */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm whitespace-nowrap">From:</span>
                  <input
                    type="date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="px-2 py-1 border rounded text-sm w-full sm:w-auto"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm whitespace-nowrap">To:</span>
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="px-2 py-1 border rounded text-sm w-full sm:w-auto"
                  />
                </div>
              </div>

              {/* Clear Button */}
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 w-full sm:w-auto text-center"
              >
                Clear Filters
              </button>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Transaction History
              </h3>
              {selectedUser.history && selectedUser.history.length > 0 ? (
                <div className="space-y-4">
                  {selectedUser.history
                    .filter((event) => {
                      if (!startDate && !endDate) return true;
                      const eventDate = new Date(event.date);
                      if (startDate && endDate) {
                        return eventDate >= startDate && eventDate <= endDate;
                      }
                      if (startDate) {
                        return eventDate >= startDate;
                      }
                      if (endDate) {
                        return eventDate <= endDate;
                      }
                      return true;
                    })
                    .map((event, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                event.type === "recharge"
                                  ? "bg-green-100 text-green-800"
                                  : event.type === "purchase"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </span>
                            {event.adminAction && (
                              <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                {event.adminAction}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 w-full sm:w-auto text-left sm:text-right">
                            {new Date(event.date).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {event.amount && (
                            <p className="font-medium">
                              Amount: {event.amount} Units
                              {event.price && ` (${event.price} USD)`}
                            </p>
                          )}
                          {event.productName && (
                            <p>Product: {event.productName}</p>
                          )}
                          {event.categoryName && (
                            <p>Category: {event.categoryName}</p>
                          )}
                          {event.emailSold && (
                            <p className="break-all">
                              Email: {event.emailSold}
                            </p>
                          )}
                          {event.status && <p>Status: {event.status}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No transaction history available for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmationModal
          title="Delete User"
          message={`Are you sure you want to delete ${
            userToDelete.fullName || userToDelete.username
          }? This action cannot be undone.`}
          isOpen={showDeleteModal}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import {
  FaEdit,
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
  FaSearch,
  FaHistory,
  FaPlusCircle,
  FaTrash,
} from "react-icons/fa";

interface User {
  _id: string;
  telegramId: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
  balance: number;
  totalRecharge: number;
  registerDate: string;
  isActive: boolean;
  isAccepted: boolean;
  history: Array<{
    amount: number;
    date: string;
    description: string;
    type: string;
    productName?: string;
  }>;
}

const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => (
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  console.log(users);
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telegramId.includes(searchTerm) ||
          user.phoneNumber?.includes(searchTerm)
      );
    }

    result.sort((a: any, b: any) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (valueA < valueB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortConfig]);

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

  const handleAddBalance = async () => {
    if (selectedUser && balanceInput) {
      const amount = parseInt(balanceInput);
      setIsUpdating(true);
      try {
        await apiClient.put(`/users/${selectedUser._id}/balance`, {
          amount,
        });
        await fetchUsers();
        setBalanceInput("");
        setShowAddBalanceModal(false);
      } catch (error) {
        console.error("Error adding balance:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };
  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await apiClient.delete(`/users/${userToDelete._id}`);
        await fetchUsers(); // Refresh user list after deletion
        setShowDeleteModal(false); // Close modal
        setUserToDelete(null); // Reset user to delete
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

  const handleViewHistory = (user: User) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
  };
  const DeleteConfirmationModal = ({
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    isOpen,
    onConfirm,
    onCancel,
  }: {
    title?: string;
    message?: string;
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
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-700">{message}</p>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-100 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Telegram ID</th>
                <th className="p-4 text-left">Full Name</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-left">Total Recharge</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    <FaSpinner className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.telegramId}</td>
                    <td className="p-4">{user.fullName || "N/A"}</td>
                    <td className="p-4">{user.phoneNumber || "N/A"}</td>
                    <td className="p-4 text-green-600 font-semibold">
                      {user.balance} Units
                    </td>
                    <td className="p-4 text-blue-600 font-semibold">
                      {user.totalRecharge} Units
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
                    <td className="p-4 flex space-x-2 items-center">
                      {/* Accept/Reject User */}
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
                      {/* View History */}
                      <button
                        onClick={() => handleViewHistory(user)}
                        className="text-gray-500 hover:text-gray-700"
                        title="View History"
                      >
                        <FaHistory />
                      </button>
                      {/* Add Balance */}
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
                          setUserToDelete(user); // Set the user to delete
                          setShowDeleteModal(true); // Show the delete modal
                        }}
                      >
                        <FaTrash />
                      </button>
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
          <div>
            <label className="block text-sm font-semibold">Enter Amount</label>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="bg-gray-300 text-gray-700 p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBalance}
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isUpdating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Add Balance"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* User History Modal */}
      {showHistoryModal && selectedUser && selectedUser.history && (
        <Modal title="User History" onClose={() => setShowHistoryModal(false)}>
          <div>
            <h3 className="text-xl font-semibold">
              History for {selectedUser.fullName}
            </h3>
            <ul className="mt-4 space-y-4">
              {selectedUser.history.length > 0 ? (
                selectedUser.history.map((entry, index) => (
                  <li key={index} className="border-b pb-2">
                    <p className="font-bold text-sm">
                      {entry.type === "charge"
                        ? "Added Balance"
                        : "Purchased Product"}
                    </p>
                    <p>{entry.description}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(entry.date).toLocaleString()}
                    </p>
                    {entry.productName && <p>Product: {entry.productName}</p>}
                    <p className="font-bold">{entry.amount} Units</p>
                  </li>
                ))
              ) : (
                <p>No history available for this user.</p>
              )}
            </ul>
          </div>
        </Modal>
      )}
      {showDeleteModal && selectedUser && (
        <Modal title="Delete User" onClose={() => setShowDeleteModal(false)}>
          <DeleteConfirmationModal
            title="Delete User"
            message={`Are you sure you want to delete ${
              userToDelete?.fullName || "this user"
            }?`}
            isOpen={showDeleteModal}
            onConfirm={handleDeleteUser}
            onCancel={() => setShowDeleteModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
[];

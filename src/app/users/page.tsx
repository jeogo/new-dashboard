"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import {
  FaEdit,
  FaHistory,
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
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
}

interface HistoryEntry {
  _id: string;
  entity: string;
  action: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userHistory, setUserHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserHistory = async (userId: string) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.get(`/historic/user/${userId}`);
      setUserHistory(response);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching user history:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (selectedUser && balanceInput) {
      const amount = parseInt(balanceInput);
      setIsUpdating(true);
      try {
        await apiClient.put(`/users/${selectedUser._id}/balance`, { amount });
        await fetchUsers();
        setBalanceInput("");
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating balance:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAcceptUser = async (userId: string) => {
    setIsUpdating(true);
    try {
      await apiClient.put(`/users/${userId}`, { isAccepted: true });
      await fetchUsers();
    } catch (error) {
      console.error("Error accepting user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setIsUpdating(true);
    try {
      await apiClient.put(`/users/${userId}`, { isAccepted: false });
      await fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>

      {isLoading ? (
        <div className="flex justify-center">
          <FaSpinner className="animate-spin text-gray-500" size={36} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 border-b">Telegram ID</th>
                <th className="text-left p-4 border-b">Username</th>
                <th className="text-left p-4 border-b">Full Name</th>
                <th className="text-left p-4 border-b">Phone Number</th>
                <th className="text-left p-4 border-b">Balance</th>
                <th className="text-left p-4 border-b">Total Recharge</th>
                <th className="text-left p-4 border-b">Accepted</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{user.telegramId}</td>
                  <td className="p-4 border-b">@{user.username}</td>
                  <td className="p-4 border-b">{user.fullName || "N/A"}</td>
                  <td className="p-4 border-b">{user.phoneNumber || "N/A"}</td>
                  <td className="p-4 border-b text-green-600 font-semibold">
                    {user.balance} Units
                  </td>
                  <td className="p-4 border-b text-blue-600 font-semibold">
                    {user.totalRecharge} Units
                  </td>
                  <td className="p-4 border-b">
                    {user.isAccepted ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-4 border-b flex space-x-4">
                    {!user.isAccepted ? (
                      <button
                        onClick={() => handleAcceptUser(user._id)}
                        className="text-green-600 hover:text-green-800"
                        title="Accept User"
                      >
                        <FaUserCheck size={24} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRejectUser(user._id)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Reject User"
                      >
                        <FaUserTimes size={24} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Adjust Balance"
                    >
                      <FaEdit size={24} />
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedUser(user);
                        await fetchUserHistory(user._id);
                      }}
                      className="text-gray-600 hover:text-gray-800"
                      title="View History"
                    >
                      <FaHistory size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && selectedUser && (
        <Modal
          title={`Adjust Balance for ${
            selectedUser.fullName || selectedUser.username
          }`}
          onClose={() => setShowEditModal(false)}
        >
          <input
            type="number"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            placeholder="Enter amount (+/-)"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleUpdateBalance}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            {isUpdating ? <FaSpinner className="animate-spin" /> : "Update"}
          </button>
        </Modal>
      )}

      {showHistoryModal && selectedUser && (
        <Modal
          title={`History for ${
            selectedUser.fullName || selectedUser.username
          }`}
          onClose={() => setShowHistoryModal(false)}
        >
          {userHistory.length > 0 ? (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {userHistory.map((entry) => (
                  <tr key={entry._id} className="border-b">
                    <td className="p-2">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2">{entry.action}</td>
                    <td className="p-2">{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No history available.</p>
          )}
        </Modal>
      )}
    </div>
  );
}

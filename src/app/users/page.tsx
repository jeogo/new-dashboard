// src/app/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface User {
  _id: string;
  telegramId: string;
  username: string;
  name: string;
  balance: number;
  registerDate: string;
  isActive: boolean;
  isAccepted: boolean;
  isBanned: boolean;
  totalRecharged: number;
}

interface HistoryEntry {
  _id: string;
  entity: string;
  entityId: string;
  action: string;
  timestamp: string;
  performedBy: {
    type: string;
    id: string | null;
  };
  details: string;
  metadata?: Record<string, any>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userHistory, setUserHistory] = useState<HistoryEntry[]>([]);
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the server
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");
      const users: User[] = response;
      setUsers(users);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  // Handle balance update with positive or negative amounts
  const handleUpdateBalance = async () => {
    if (selectedUser && balanceInput) {
      const amount = parseInt(balanceInput);

      try {
        // Update balance on the server
        await apiClient.put(`/users/${selectedUser._id}/balance`, { amount });

        // Refresh users list to update balance
        await fetchUsers();
        setBalanceInput("");
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    }
  };

  // Handle reset balance
  const handleResetBalance = async () => {
    if (selectedUser) {
      try {
        // Reset balance on the server
        await apiClient.put(`/users/${selectedUser._id}/reset`, {});

        // Refresh users list to update balance
        await fetchUsers();
        setShowResetModal(false);
      } catch (error) {
        console.error("Error resetting user balance:", error);
      }
    }
  };

  // Handle accept user
  const handleAcceptUser = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { isAccepted: true });
      await fetchUsers();
    } catch (error) {
      console.error("Error accepting user:", error);
    }
  };

  // Handle reject user
  const handleRejectUser = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { isAccepted: false });
      await fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  // Fetch user history
  const fetchUserHistory = async (userId: string) => {
    try {
      const response = await apiClient.get(`/history/user/${userId}`);
      const historyEntries: HistoryEntry[] = response;
      setUserHistory(historyEntries);
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  // Calculate total recharged amount
  const calculateTotalRecharge = (user: User) => {
    return user.totalRecharged || 0;
  };

  // Handle ban user
  const handleBanUser = async () => {
    if (selectedUser) {
      try {
        await apiClient.put(`/users/${selectedUser._id}`, { isBanned: true });
        await fetchUsers();
        setShowBanModal(false);
      } catch (error) {
        console.error("Error banning user:", error);
      }
    }
  };

  // Handle unban user
  const handleUnbanUser = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { isBanned: false });
      await fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 border-b">Telegram ID</th>
                <th className="text-left p-4 border-b">Username</th>
                <th className="text-left p-4 border-b">Name</th>
                <th className="text-left p-4 border-b">Balance</th>
                <th className="text-left p-4 border-b">Total Recharged</th>
                <th className="text-left p-4 border-b">Accepted</th>
                <th className="text-left p-4 border-b">Banned</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{user.telegramId}</td>
                  <td className="p-4 border-b">@{user.username}</td>
                  <td className="p-4 border-b">{user.name}</td>
                  <td className="p-4 border-b text-green-600 font-semibold">
                    {user.balance} Units
                  </td>
                  <td className="p-4 border-b text-blue-600 font-semibold">
                    {calculateTotalRecharge(user)} Units
                  </td>
                  <td className="p-4 border-b">
                    {user.isAccepted ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-4 border-b">
                    {user.isBanned ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-green-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-4 border-b space-x-2 flex flex-wrap">
                    {!user.isAccepted ? (
                      <button
                        onClick={() => handleAcceptUser(user._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRejectUser(user._id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Adjust Balance
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedUser(user);
                        await fetchUserHistory(user._id);
                        setShowHistoryModal(true);
                      }}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetModal(true);
                      }}
                      className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 transition"
                    >
                      Reset Balance
                    </button>
                    {!user.isBanned ? (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                      >
                        Ban User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnbanUser(user._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                      >
                        Unban User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">
              Adjust Balance for {selectedUser.name}
            </h2>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              placeholder="Enter amount (+/-)"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setBalanceInput("");
                  setShowEditModal(false);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBalance}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              History for {selectedUser.name}
            </h2>
            {userHistory.length > 0 ? (
              <ul className="space-y-2">
                {userHistory
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li key={entry._id} className="border-b pb-2">
                      <p className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      <p>
                        {entry.details}{" "}
                        {entry.metadata && entry.metadata.amount && (
                          <span
                            className={
                              entry.metadata.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {entry.metadata.amount > 0 ? "+" : ""}
                            {entry.metadata.amount} Units
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No history available.</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Balance Confirmation Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
            <p>
              Are you sure you want to reset the balance for {selectedUser.name}
              ?
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetBalance}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Confirmation Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Confirm Ban</h2>
            <p>
              Are you sure you want to ban {selectedUser.name}? They will not be
              able to access the bot.
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowBanModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

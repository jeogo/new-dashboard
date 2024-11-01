// src/app/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface HistoryEntry {
  date: string;
  type: string;
  amount: number;
  description: string;
}

interface User {
  _id: string;
  telegramId: string;
  username: string;
  name: string;
  balance: number;
  registerDate: string;
  history: HistoryEntry[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the server
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/users");
      setUsers(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  // Calculate total recharged amount
  const calculateTotalRecharge = (user: User) =>
    user.history
      .filter((entry) => entry.type === "charge" && entry.amount > 0)
      .reduce((total, entry) => total + entry.amount, 0);

  // Handle balance update with positive or negative amounts
  const handleUpdateBalance = async () => {
    if (selectedUser && balanceInput) {
      const amount = parseInt(balanceInput);

      try {
        // Update balance on the server
        await apiClient.put(`/users/${selectedUser._id}/balance`, { amount });

        // Refresh users list to update balance
        fetchUsers();
        setBalanceInput("");
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    }
  };

  // Handle reset balance and history
  const handleResetBalance = async () => {
    if (selectedUser) {
      try {
        // Reset balance and history on the server
        await apiClient.put(`/users/${selectedUser._id}/reset`, {});

        // Refresh users list to update balance and history
        fetchUsers();
        setShowResetModal(false);
      } catch (error) {
        console.error("Error resetting user account:", error);
      }
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
            <thead>
              <tr>
                <th className="text-left p-4 border-b">Telegram ID</th>
                <th className="text-left p-4 border-b">Username</th>
                <th className="text-left p-4 border-b">Name</th>
                <th className="text-left p-4 border-b">Balance</th>
                <th className="text-left p-4 border-b">Total Recharged</th>
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
                    {user.balance} Points
                  </td>
                  <td className="p-4 border-b text-blue-600 font-semibold">
                    {calculateTotalRecharge(user)} Points
                  </td>
                  <td className="p-4 border-b space-x-2">
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
                      onClick={() => {
                        setSelectedUser(user);
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
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Reset Account
                    </button>
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
                onClick={() => setShowEditModal(false)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              History for {selectedUser.name}
            </h2>
            {selectedUser.history.length > 0 ? (
              <ul className="space-y-2">
                {selectedUser.history
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <li key={index} className="border-b pb-2">
                      <p className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleString()}
                      </p>
                      <p>
                        {entry.description} (
                        <span
                          className={
                            entry.amount > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {entry.amount > 0 ? "+" : ""}
                          {entry.amount} Points
                        </span>
                        )
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

      {/* Reset Account Confirmation Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
            <p>
              Are you sure you want to reset the balance and history for{" "}
              {selectedUser.name}?
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
    </div>
  );
}

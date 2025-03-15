import React, { useState } from "react";
import { apiClient } from "@/app/utils/apiClient";
import { User } from "@/app/users/page";


interface UserDetailsDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      await apiClient.put(`/users/${user._id}`, formData);
      onUpdate(formData);
      onClose();
    } catch (error: any) {
      setError("Error updating user details. Please try again later.");
      console.error("Error updating user details:", error.message);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Edit User Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {error && (
              <div className="text-red-500 mb-4 px-6 pt-4">{error}</div>
            )}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
        
                <div>
                  <label className="block text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Telegram ID</label>
                  <input
                    type="text"
                    name="telegramId"
                    value={formData.telegramId || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 flex justify-end space-x-2 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetailsDialog;

// src/app/categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface CategoryHistoryEntry {
  date: string;
  type: string;
  description: string;
}

interface Category {
  _id: string;
  name: string;
  categoryHistory: CategoryHistoryEntry[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/categories");
      setCategories(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsLoading(false);
    }
  };

  // Add Category
  const handleCreateCategory = async () => {
    try {
      if (newCategoryName.trim() === "") {
        alert("Category name cannot be empty.");
        return;
      }

      await apiClient.post("/categories", { name: newCategoryName });

      setNewCategoryName("");
      setShowCreateModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Edit Category
  const handleEditCategory = async () => {
    try {
      if (selectedCategory && newCategoryName.trim() !== "") {
        await apiClient.put(`/categories/${selectedCategory._id}`, {
          name: newCategoryName,
        });

        setSelectedCategory(null);
        setNewCategoryName("");
        setShowEditModal(false);
        fetchCategories();
      } else {
        alert("Category name cannot be empty.");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    try {
      if (selectedCategory) {
        await apiClient.delete(`/categories/${selectedCategory._id}`);

        setSelectedCategory(null);
        setShowDeleteModal(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition"
      >
        Add Category
      </button>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                {/* Removed ID column */}
                <th className="text-left p-4 border-b">Name</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{category.name}</td>
                  <td className="p-4 border-b space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setNewCategoryName(category.name);
                        setShowEditModal(true);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCategoryName("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setNewCategoryName("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Delete Category</h2>
            <p>
              Are you sure you want to delete the category "
              <strong>{selectedCategory.name}</strong>"?
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

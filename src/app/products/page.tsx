// src/app/products/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  emails: string[];
  categoryId: string;
  password: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: "",
    emailsText: "",
    categoryId: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products from the server
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/products");
      setProducts(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Helper function to process raw email text into an array of emails
  const extractEmails = (text: string) => {
    return text
      .split(/[\s,;]+/) // Split by whitespace, commas, or semicolons
      .map((email) => email.trim()) // Remove extra spaces
      .filter((email) => email); // Filter out empty entries
  };

  // Function to handle the creation of a new product
  const handleCreateProduct = async () => {
    try {
      const { name, description, price, emailsText, categoryId, password } =
        newProductData;

      // Validation
      if (!name || !price || !categoryId) {
        alert("Name, Price, and Category are required.");
        return;
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        emails: extractEmails(emailsText),
        categoryId,
        password,
      };

      await apiClient.post("/products", productData);
      resetFormData();
      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Function to open the edit modal with selected product's data
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setNewProductData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      emailsText: product.emails.join(", "),
      categoryId: product.categoryId,
      password: product.password,
    });
    setShowEditModal(true);
  };

  // Function to save edits to the selected product
  const handleSaveEdit = async () => {
    if (selectedProduct) {
      try {
        const { name, description, price, emailsText, categoryId, password } =
          newProductData;

        // Validation
        if (!name || !price || !categoryId) {
          alert("Name, Price, and Category are required.");
          return;
        }

        const updatedProductData = {
          name,
          description,
          price: parseFloat(price),
          emails: extractEmails(emailsText),
          categoryId,
          password,
        };

        await apiClient.put(
          `/products/${selectedProduct._id}`,
          updatedProductData
        );

        resetFormData();
        setShowEditModal(false);
        fetchProducts();
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  // Function to confirm deletion of a product
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Function to delete the selected product
  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        await apiClient.delete(`/products/${selectedProduct._id}`);
        setSelectedProduct(null);
        setShowDeleteModal(false);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Helper function to reset form data to initial state
  const resetFormData = () => {
    setNewProductData({
      name: "",
      description: "",
      price: "",
      emailsText: "",
      categoryId: "",
      password: "",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Button to open the Create Product Modal */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 text-white px-6 py-2 rounded-lg mb-4 shadow hover:bg-green-600 transition"
      >
        Add New Product
      </button>

      {/* Product Table */}
      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left text-sm font-semibold uppercase">
                {/* Removed ID column */}
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Description</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b">{product.name}</td>
                  <td className="p-4 border-b">
                    {product.description || "N/A"}
                  </td>
                  <td className="p-4 border-b">${product.price}</td>
                  <td className="p-4 border-b">
                    {categories.find(
                      (category) => category._id === product.categoryId
                    )?.name || "Uncategorized"}
                  </td>
                  <td className="p-4 border-b space-x-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 transition"
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

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newProductData.name}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, name: e.target.value })
                }
                placeholder="Product Name"
                className="p-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newProductData.description}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="p-3 border border-gray-300 rounded"
              />
              <input
                type="number"
                value={newProductData.price}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    price: e.target.value,
                  })
                }
                placeholder="Price"
                className="p-3 border border-gray-300 rounded"
              />
              <select
                value={newProductData.categoryId}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    categoryId: e.target.value,
                  })
                }
                className="p-3 border border-gray-300 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Emails Textarea */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Emails (free text)</h3>
              <textarea
                value={newProductData.emailsText}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    emailsText: e.target.value,
                  })
                }
                placeholder="Enter emails freely with line breaks, spaces, commas, or semicolons."
                className="w-full p-3 border border-gray-300 rounded resize-y"
                rows={4}
              />
            </div>

            <input
              type="text"
              value={newProductData.password}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  password: e.target.value,
                })
              }
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded mt-4"
            />

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetFormData();
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newProductData.name}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, name: e.target.value })
                }
                placeholder="Product Name"
                className="p-3 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newProductData.description}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                className="p-3 border border-gray-300 rounded"
              />
              <input
                type="number"
                value={newProductData.price}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    price: e.target.value,
                  })
                }
                placeholder="Price"
                className="p-3 border border-gray-300 rounded"
              />
              <select
                value={newProductData.categoryId}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    categoryId: e.target.value,
                  })
                }
                className="p-3 border border-gray-300 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Emails Textarea */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Emails (free text)</h3>
              <textarea
                value={newProductData.emailsText}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    emailsText: e.target.value,
                  })
                }
                placeholder="Enter emails freely with line breaks, spaces, commas, or semicolons."
                className="w-full p-3 border border-gray-300 rounded resize-y"
                rows={4}
              />
            </div>

            <input
              type="text"
              value={newProductData.password}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  password: e.target.value,
                })
              }
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded mt-4"
            />

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetFormData();
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-center">
              Are you sure you want to delete this product?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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

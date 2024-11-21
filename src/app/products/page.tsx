"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import {
  FaEdit,
  FaTrash,
  FaHistory,
  FaPlusCircle,
  FaSpinner,
} from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  emails: string[];
  categoryId: string;
  isAvailable: boolean;
  allowPreOrder: boolean;
  createdDate: string;
}

interface Category {
  _id: string;
  name: string;
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
  onConfirm,
  confirmText = "Confirm",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
      <div className="flex justify-end mt-4 space-x-4">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Close
        </button>
        {onConfirm && (
          <button
            onClick={onConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            {confirmText}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [productHistory, setProductHistory] = useState<HistoryEntry[]>([]);
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: "",
    emailsText: "",
    categoryId: "",
    isAvailable: false,
    allowPreOrder: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/products");
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProductHistory = async (productId: string) => {
    try {
      const response = await apiClient.get(`/historic/product/${productId}`);
      setProductHistory(response);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching product history:", error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const {
        name,
        description,
        price,
        emailsText,
        categoryId,
        isAvailable,
        allowPreOrder,
      } = newProductData;

      if (!name || !price || !categoryId) {
        alert("Name, Price, and Category are required.");
        return;
      }

      const emailsArray = emailsText
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const productData = {
        name,
        description,
        price: parseFloat(price),
        emails: emailsArray,
        categoryId,
        isAvailable,
        allowPreOrder,
      };

      await apiClient.post("/products", productData);
      resetFormData();
      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setNewProductData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      emailsText: product.emails.join(", "),
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      allowPreOrder: product.allowPreOrder,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedProduct) {
      try {
        const {
          name,
          description,
          price,
          emailsText,
          categoryId,
          isAvailable,
          allowPreOrder,
        } = newProductData;

        if (!name || !price || !categoryId) {
          alert("Name, Price, and Category are required.");
          return;
        }

        const updatedProductData = {
          name,
          description,
          price: parseFloat(price),
          emails: emailsText
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0),
          categoryId,
          isAvailable,
          allowPreOrder,
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

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

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

  const resetFormData = () => {
    setNewProductData({
      name: "",
      description: "",
      price: "",
      emailsText: "",
      categoryId: "",
      isAvailable: false,
      allowPreOrder: false,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Product Management
      </h1>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 text-white px-6 py-2 rounded-lg mb-4 shadow hover:bg-green-600"
      >
        <FaPlusCircle className="inline-block mr-2" /> Add New Product
      </button>

      {isLoading ? (
        <div className="flex justify-center">
          <FaSpinner className="animate-spin text-gray-500" size={36} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 border-b">Name</th>
                <th className="text-left p-4 border-b">Price</th>
                <th className="text-left p-4 border-b">Category</th>
                <th className="text-left p-4 border-b">Available</th>
                <th className="text-left p-4 border-b">Pre-Order</th>
                <th className="text-left p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="p-4 border-b">{product.name}</td>
                  <td className="p-4 border-b">{product.price} Units</td>
                  <td className="p-4 border-b">
                    {categories.find((cat) => cat._id === product.categoryId)
                      ?.name || "Uncategorized"}
                  </td>
                  <td className="p-4 border-b">
                    {product.isAvailable ? "Yes" : "No"}
                  </td>
                  <td className="p-4 border-b">
                    {product.allowPreOrder ? "Yes" : "No"}
                  </td>
                  <td className="p-4 border-b flex space-x-2">
                    <button
                      onClick={() => fetchProductHistory(product._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      <FaHistory />
                    </button>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTrash />
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
        <Modal
          title="Create New Product"
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateProduct}
        >
          <div>
            <input
              type="text"
              placeholder="Product Name"
              value={newProductData.name}
              onChange={(e) =>
                setNewProductData({ ...newProductData, name: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Description"
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  description: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={newProductData.price}
              onChange={(e) =>
                setNewProductData({ ...newProductData, price: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Emails (comma-separated)"
              value={newProductData.emailsText}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  emailsText: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={newProductData.categoryId}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  categoryId: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="checkbox"
                  checked={newProductData.isAvailable}
                  onChange={() =>
                    setNewProductData({
                      ...newProductData,
                      isAvailable: !newProductData.isAvailable,
                    })
                  }
                />
                Available
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newProductData.allowPreOrder}
                  onChange={() =>
                    setNewProductData({
                      ...newProductData,
                      allowPreOrder: !newProductData.allowPreOrder,
                    })
                  }
                />
                Allow Pre-Order
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <Modal
          title="Edit Product"
          onClose={() => setShowEditModal(false)}
          onConfirm={handleSaveEdit}
        >
          <div>
            <input
              type="text"
              placeholder="Product Name"
              value={newProductData.name}
              onChange={(e) =>
                setNewProductData({ ...newProductData, name: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Description"
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  description: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={newProductData.price}
              onChange={(e) =>
                setNewProductData({ ...newProductData, price: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Emails (comma-separated)"
              value={newProductData.emailsText}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  emailsText: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={newProductData.categoryId}
              onChange={(e) =>
                setNewProductData({
                  ...newProductData,
                  categoryId: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="checkbox"
                  checked={newProductData.isAvailable}
                  onChange={() =>
                    setNewProductData({
                      ...newProductData,
                      isAvailable: !newProductData.isAvailable,
                    })
                  }
                />
                Available
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newProductData.allowPreOrder}
                  onChange={() =>
                    setNewProductData({
                      ...newProductData,
                      allowPreOrder: !newProductData.allowPreOrder,
                    })
                  }
                />
                Allow Pre-Order
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Product Modal */}
      {showDeleteModal && selectedProduct && (
        <Modal
          title="Delete Product"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
        >
          <div>
            Are you sure you want to delete{" "}
            <strong>{selectedProduct.name}</strong>?
          </div>
        </Modal>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <Modal
          title="Product History"
          onClose={() => setShowHistoryModal(false)}
        >
          <div>
            {productHistory.length > 0 ? (
              <ul>
                {productHistory.map((entry) => (
                  <li key={entry._id}>
                    <p className="font-bold">{entry.action}</p>
                    <p>{entry.timestamp}</p>
                    <p>{entry.details}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No history available.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

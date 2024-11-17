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

  // Fetch product history from the server
  const fetchProductHistory = async (productId: string) => {
    try {
      const response = await apiClient.get(`/history/product/${productId}`);
      setProductHistory(response);
    } catch (error) {
      console.error("Error fetching product history:", error);
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
      const {
        name,
        description,
        price,
        emailsText,
        categoryId,
        isAvailable,
        allowPreOrder,
      } = newProductData;

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

  // Function to open the edit modal with selected product's data
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

  // Function to save edits to the selected product
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

  // Function to view product history
  const handleViewHistory = async (product: Product) => {
    setSelectedProduct(product);
    await fetchProductHistory(product._id);
    setShowHistoryModal(true);
  };

  // Helper function to reset form data to initial state
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
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Description</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Emails Count</th>
                <th className="p-4 border-b">Available</th>
                <th className="p-4 border-b">Pre-Order</th>
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
                  <td className="p-4 border-b">{product.emails.length}</td>
                  <td className="p-4 border-b">
                    {product.isAvailable ? "Yes" : "No"}
                  </td>
                  <td className="p-4 border-b">
                    {product.allowPreOrder ? "Yes" : "No"}
                  </td>
                  <td className="p-4 border-b flex flex-wrap gap-2">
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
                    <button
                      onClick={() => handleViewHistory(product)}
                      className="bg-gray-500 text-white px-3 py-1 rounded shadow hover:bg-gray-600 transition"
                    >
                      View History
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
          title="Add New Product"
          onCancel={() => {
            setShowCreateModal(false);
            resetFormData();
          }}
          onConfirm={handleCreateProduct}
          confirmText="Add Product"
        >
          <ProductForm
            productData={newProductData}
            setProductData={setNewProductData}
            categories={categories}
          />
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <Modal
          title="Edit Product"
          onCancel={() => {
            setShowEditModal(false);
            resetFormData();
          }}
          onConfirm={handleSaveEdit}
          confirmText="Save Changes"
        >
          <ProductForm
            productData={newProductData}
            setProductData={setNewProductData}
            categories={categories}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Product"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
        >
          <p>Are you sure you want to delete this product?</p>
        </Modal>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedProduct && (
        <Modal
          title={`History for ${selectedProduct.name}`}
          onCancel={() => setShowHistoryModal(false)}
        >
          {productHistory.length > 0 ? (
            <ul className="space-y-2">
              {productHistory.map((entry) => (
                <li key={entry._id} className="border-b pb-2">
                  <p className="text-sm text-gray-600">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p>{entry.details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No history available.</p>
          )}
        </Modal>
      )}
    </div>
  );
}

function ProductForm({
  productData,
  setProductData,
  categories,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        value={productData.name}
        onChange={(e) =>
          setProductData({ ...productData, name: e.target.value })
        }
        placeholder="Product Name"
        className="p-3 border border-gray-300 rounded"
      />
      <input
        type="text"
        value={productData.description}
        onChange={(e) =>
          setProductData({ ...productData, description: e.target.value })
        }
        placeholder="Description"
        className="p-3 border border-gray-300 rounded"
      />
      <input
        type="number"
        value={productData.price}
        onChange={(e) =>
          setProductData({ ...productData, price: e.target.value })
        }
        placeholder="Price"
        className="p-3 border border-gray-300 rounded"
      />
      <select
        value={productData.categoryId}
        onChange={(e) =>
          setProductData({ ...productData, categoryId: e.target.value })
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
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={productData.isAvailable}
          onChange={(e) =>
            setProductData({ ...productData, isAvailable: e.target.checked })
          }
          className="h-5 w-5"
        />
        <label>Available</label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={productData.allowPreOrder}
          onChange={(e) =>
            setProductData({ ...productData, allowPreOrder: e.target.checked })
          }
          className="h-5 w-5"
        />
        <label>Allow Pre-Order</label>
      </div>
      {/* Emails Textarea */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold mb-2">Emails (free text)</h3>
        <textarea
          value={productData.emailsText}
          onChange={(e) =>
            setProductData({ ...productData, emailsText: e.target.value })
          }
          placeholder="Enter emails freely with line breaks, spaces, commas, or semicolons."
          className="w-full p-3 border border-gray-300 rounded resize-y"
          rows={4}
        />
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
}: {
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
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
}

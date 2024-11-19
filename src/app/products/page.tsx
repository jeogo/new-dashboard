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

      const productData = {
        name,
        description,
        price: parseFloat(price),
        emails: emailsText.split(",").map((email) => email.trim()),
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
          emails: emailsText.split(",").map((email) => email.trim()),
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
                  <td className="p-4 border-b space-x-3">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit Product"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Product"
                    >
                      <FaTrash size={18} />
                    </button>
                    <button
                      onClick={() => fetchProductHistory(product._id)}
                      className="text-gray-500 hover:text-gray-700"
                      title="View History"
                    >
                      <FaHistory size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Add New Product"
          onClose={() => {
            setShowCreateModal(false);
            resetFormData();
          }}
          onConfirm={handleCreateProduct}
          confirmText="Add Product"
        >
          <ProductForm
            productData={newProductData}
            setProductData={setNewProductData}
            categories={categories} // Pass categories here
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal
          title="Edit Product"
          onClose={() => {
            setShowEditModal(false);
            resetFormData();
          }}
          onConfirm={handleSaveEdit}
          confirmText="Save Changes"
        >
          <ProductForm
            productData={newProductData}
            setProductData={setNewProductData}
            categories={categories} // Pass categories here
          />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal
          title="Delete Product"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
        >
          Are you sure you want to delete this product?
        </Modal>
      )}

      {showHistoryModal && selectedProduct && (
        <Modal
          title={`History for ${selectedProduct.name}`}
          onClose={() => setShowHistoryModal(false)}
        >
          {productHistory.length > 0 ? (
            <ul>
              {productHistory.map((entry) => (
                <li key={entry._id}>
                  <p>{new Date(entry.timestamp).toLocaleString()}</p>
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
  categories: Category[]; // Pass categories as a prop
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <input
        type="text"
        value={productData.name}
        onChange={(e) =>
          setProductData({ ...productData, name: e.target.value })
        }
        placeholder="Product Name"
        className="p-3 border border-gray-300 rounded"
      />
      <textarea
        value={productData.description}
        onChange={(e) =>
          setProductData({ ...productData, description: e.target.value })
        }
        placeholder="Description"
        className="p-3 border border-gray-300 rounded resize-y"
        rows={3}
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
      <textarea
        value={productData.emailsText}
        onChange={(e) =>
          setProductData({ ...productData, emailsText: e.target.value })
        }
        placeholder="Emails (comma-separated)"
        className="p-3 border border-gray-300 rounded resize-y"
        rows={3}
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
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={productData.isAvailable}
          onChange={(e) =>
            setProductData({ ...productData, isAvailable: e.target.checked })
          }
        />
        <label>Available</label>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={productData.allowPreOrder}
          onChange={(e) =>
            setProductData({ ...productData, allowPreOrder: e.target.checked })
          }
        />
        <label>Allow Pre-Order</label>
      </div>
    </div>
  );
}

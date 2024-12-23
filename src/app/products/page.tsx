"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import {
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaSpinner,
  FaTimes,
  FaExclamationTriangle,
  FaCheck,
  FaHistory,
} from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  emails: string[];
  categoryId: string;
  isAvailable: boolean;
  allowPreOrder: boolean;
  createdDate: Date;
  archive: Array<any>;
  salesHistory?: ProductSaleEvent[];
  history?: ProductHistoryEntry[];
}

interface ProductSaleEvent {
  userId: string;
  fullName: string;
  date: Date;
  price: number;
  emailPassword: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductHistoryEntry {
  action: "create" | "update" | "delete" | "sale";
  date: Date;
  details: string;
  updatedFields?: Record<string, any>;
  userDetails?: { fullName: string; phone: string };
  productDetails?: { productName: string; categoryName: string };
}
interface User {
  _id?: string;
  telegramId: string;
  chatId: string;
  username: string;
  name: string;
  fullName?: string;
  phoneNumber?: string;
  balance: number;
  registerDate: Date;
  isAccepted: boolean;
  history?: UserEvent[];
}

interface UserEvent {
  type: "recharge" | "status" | "delete" | "purchase";
  date: Date;
  amount?: number;
  status?: string;
  productId?: string;
  productName?: string;
  price?: number;
  emailSold?: string;
  categoryName?: string;
  adminAction?: "Recharge" | "Discount";
}

interface ArchiveEntry {
  emailPassword: string;
  soldTo: string;
  soldAt: Date;
  price: number;
}
interface AlertProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}
const HistoryModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState<
    Array<{
      sale: ArchiveEntry;
      user?: User;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    if (!product.archive?.length) return;

    setIsLoading(true);
    try {
      const salesWithUsers = await Promise.all(
        product.archive.map(async (sale: ArchiveEntry) => {
          try {
            const user = await apiClient.get(`/users/${sale.soldTo}`);
            return { sale, user };
          } catch {
            return { sale, user: undefined };
          }
        })
      );
      setSalesData(salesWithUsers);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllHistoryEntries = () => {
    const historyEntries = [...(product.history || [])];

    const salesEntries = salesData.map(({ sale, user }) => ({
      action: "sale",
      date: new Date(sale.soldAt),
      details: `Product sold to ${user?.fullName || "Unknown User"}`,
      updatedFields: {
        price: sale.price,
        emailPassword: sale.emailPassword,
      },
      userDetails: user
        ? {
            fullName: user.fullName || "N/A",
            phone: user.phoneNumber || "N/A",
          }
        : undefined,
      productDetails: {
        productName: product.name,
        categoryName: "N/A",
      },
    }));

    return [...historyEntries, ...salesEntries]
      .filter((entry) => {
        const passesActionFilter =
          selectedAction === "all" || entry.action === selectedAction;
        const entryDate = new Date(entry.date);
        const passesStartDate = !startDate || entryDate >= new Date(startDate);
        const passesEndDate = !endDate || entryDate <= new Date(endDate);
        return passesActionFilter && passesStartDate && passesEndDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  };
  interface EmailChanges {
    old?: string[];
    new?: string[];
    added?: string[];
    removed?: string[];
  }

  const formatChanges = (entry: any) => {
    if (entry.action === "sale") {
      return (
        <div className="space-y-1">
          <div className="font-medium text-purple-600">Sale Details:</div>
          <div>Price: ${entry.updatedFields.price}</div>
          <div>Email: {entry.updatedFields.emailPassword}</div>
        </div>
      );
    }
    const handleEmailChanges = (value: EmailChanges = {}) => {
      const {
          old = [], 
          new: newEmails = [], 
          added = [], 
          removed = []
      } = value;

      return (
          <div className="space-y-2">
              {removed.length > 0 && (
                  <div className="text-red-600">
                      Removed: {removed.join(", ")}
                  </div>
              )}
              {added.length > 0 && (
                  <div className="text-green-600">
                      Added: {added.join(", ")}
                  </div>
              )}
              {old.length > 0 && newEmails.length > 0 && (
                  <div>
                      Changed from: {old.join(", ")} to {newEmails.join(", ")}
                  </div>
              )}
          </div>
      );
  };
    if (!entry.updatedFields) return null;

    return (
      <div className="space-y-2">
   {Object.entries(entry.updatedFields).map(([field, value]) => {
                if (field === "emails") {
                    return (
                        <div key={field}>
                            <span className="font-medium">Email Updates:</span>
                            {handleEmailChanges(value as EmailChanges)}
                        </div>
                    );
                }})}
      </div>
    );
  };

  const historyEntries = getAllHistoryEntries();

  return (
    <Modal title={`History - ${product.name}`} onClose={onClose}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Action Type
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="sale">Sale</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <select
              className="w-full p-2 border rounded"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading history...</div>
          ) : historyEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No history entries found.
            </div>
          ) : (
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Changes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {entry.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{formatChanges(entry)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.userDetails ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {entry.userDetails.fullName}
                            </div>
                            <div className="text-gray-500">
                              {entry.userDetails.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const Alert = ({ type, message, onClose }: AlertProps) => {
  const bgColor = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  }[type];

  const Icon = {
    success: FaCheck,
    error: FaExclamationTriangle,
    warning: FaExclamationTriangle,
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} z-50 flex items-center shadow-lg`}
    >
      <Icon className="mr-2" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <FaTimes />
      </button>
    </div>
  );
};

const Modal = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  isDanger = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  isDanger?: boolean;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimes />
        </button>
      </div>
      {children}
      <div className="flex justify-end mt-4 space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        {onConfirm && (
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition ${
              isDanger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
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
  const [showDeleteEmailModal, setShowDeleteEmailModal] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [emailsToAdd, setEmailsToAdd] = useState<string[]>([]);
  const [emailStats, setEmailStats] = useState({
    valid: 0,
    invalid: 0,
    duplicate: 0,
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const validateEmails = (emailString: string) => {
    const emailList = emailString
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    const stats = {
      valid: 0,
      invalid: 0,
      duplicate: 0,
    };

    const validEmails = emailList.filter((email) => {
      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isDuplicate = selectedProduct?.emails.includes(email);

      if (!isValidFormat) {
        stats.invalid++;
      } else if (isDuplicate) {
        stats.duplicate++;
      } else {
        stats.valid++;
      }

      return isValidFormat && !isDuplicate;
    });

    setEmailStats(stats);
    return validEmails;
  };

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: "",
    emailsText: "",
    categoryId: "",
    isAvailable: false,
    allowPreOrder: false,
  });

  const showAlert = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response);
    } catch (error) {
      showAlert("error", "Failed to fetch categories");
      console.error("Error fetching categories:", error);
    }
  };

  const handleDeleteEmail = async (email: string) => {
    if (!selectedProduct) {
      showAlert("error", "No product selected");
      return;
    }

    if (!email || !selectedProduct.emails.includes(email)) {
      showAlert("error", "Invalid email or email not found");
      return;
    }

    try {
      setIsLoading(true);

      // Verify the product still exists
      const productCheck = await apiClient.get(
        `/products/${selectedProduct._id}`
      );
      if (!productCheck) {
        throw new Error("Product not found");
      }

      // Create the updated product data
      const updatedEmails = selectedProduct.emails.filter((e) => e !== email);

      // Check if the emails array is empty
      if (updatedEmails.length === 0) {
        showAlert(
          "warning",
          "Cannot delete the last email. Please add another email first."
        );
        return;
      }

      const updatedProduct = {
        ...selectedProduct,
        emails: updatedEmails,
      };

      const response = await apiClient.put(
        `/products/${selectedProduct._id}`,
        updatedProduct
      );

      if (!response) {
        throw new Error("No response from server");
      }

      // Update local state only after successful API call
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === selectedProduct._id ? { ...p, emails: updatedEmails } : p
        )
      );

      setSelectedProduct((prev) =>
        prev ? { ...prev, emails: updatedEmails } : null
      );

      showAlert("success", "Email deleted successfully");
      setShowDeleteEmailModal(false);
      setEmailToDelete("");
    } catch (error: any) {
      console.error("Error in handleDeleteEmail:", error);
      if (error.message === "Product not found") {
        showAlert("error", "Product no longer exists. Refreshing list...");
        setSelectedProduct(null);
        setShowDeleteEmailModal(false);
        await fetchProducts();
      } else {
        showAlert("error", "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update fetchProducts to handle errors better
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/products");

      if (!response) {
        throw new Error("Failed to fetch products");
      }

      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("error", "Failed to fetch products. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const validatedEmails = validateEmails(newEmail);

    if (validatedEmails.length > 0) {
      setEmailsToAdd(validatedEmails);
      setShowEmailConfirmModal(true);
    } else {
      showAlert("warning", "No valid new emails to add");
    }
  };

  const confirmAddEmails = async () => {
    if (!selectedProduct || emailsToAdd.length === 0) return;

    try {
      const updatedEmails = [...selectedProduct.emails, ...emailsToAdd];
      const response = await apiClient.put(`/products/${selectedProduct._id}`, {
        ...selectedProduct,
        emails: updatedEmails,
      });

      if (!response) {
        throw new Error("Failed to update product");
      }

      setSelectedProduct({
        ...selectedProduct,
        emails: updatedEmails,
      });

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === selectedProduct._id ? { ...p, emails: updatedEmails } : p
        )
      );

      setNewEmail("");
      setEmailsToAdd([]);
      setShowEmailConfirmModal(false);
      showAlert("success", `Successfully added ${emailsToAdd.length} email(s)`);
    } catch (error) {
      console.error("Error adding emails:", error);
      showAlert("error", "Failed to add emails");
    }
  };
  const EmailConfirmationModal = () => (
    <Modal
      title="Confirm Add Emails"
      onClose={() => setShowEmailConfirmModal(false)}
      onConfirm={confirmAddEmails}
      confirmText="Add Emails"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Email Analysis:</h3>
          <div className="space-y-2">
            <p className="text-green-600">
              Valid new emails: {emailStats.valid}
            </p>
            {emailStats.invalid > 0 && (
              <p className="text-red-600">
                Invalid emails: {emailStats.invalid}
              </p>
            )}
            {emailStats.duplicate > 0 && (
              <p className="text-yellow-600">
                Duplicate emails: {emailStats.duplicate}
              </p>
            )}
          </div>
        </div>

        {emailsToAdd.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Emails to be added:</h3>
            <div className="max-h-40 overflow-y-auto bg-white border rounded-lg p-2">
              {emailsToAdd.map((email, index) => (
                <div key={index} className="py-1 px-2 hover:bg-gray-50">
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
  const handleCreateProduct = async () => {
    try {
      const {
        name,
        price,
        emailsText,
        categoryId,
        isAvailable,
        allowPreOrder,
      } = newProductData;

      if (!name || !price || !categoryId) {
        showAlert("error", "Name, Price, and Category are required");
        return;
      }

      const emailsArray = emailsText
        .split(",")
        .map((email) => email.trim())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

      if (emailsArray.length === 0) {
        showAlert("error", "At least one valid email is required");
        return;
      }

      const productData = {
        name,
        description: "",
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
      showAlert("success", "Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
      showAlert("error", "Failed to create product");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) {
      showAlert("error", "No product selected");
      return;
    }

    try {
      const { name, price, categoryId, isAvailable, allowPreOrder } =
        newProductData;

      if (!name || !price || !categoryId) {
        showAlert("error", "Name, Price, and Category are required");
        return;
      }

      const updatedProductData = {
        ...selectedProduct,
        name,
        price: parseFloat(price),
        categoryId,
        isAvailable,
        allowPreOrder,
      };

      const response = await apiClient.put(
        `/products/${selectedProduct._id}`,
        updatedProductData
      );

      if (!response) {
        throw new Error("Failed to update product");
      }

      resetFormData();
      setShowEditModal(false);
      fetchProducts();

      // Show confirmation message after successful edit
      showAlert("success", "Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      showAlert("error", "Failed to update product");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) {
      showAlert("error", "No product selected");
      return;
    }

    try {
      await apiClient.delete(`/products/${selectedProduct._id}`);
      setSelectedProduct(null);
      setShowDeleteModal(false);
      fetchProducts();
      showAlert("success", "Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("error", "Failed to delete product");
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
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-center">
        Product Management
      </h1>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 text-white px-6 py-2 rounded-lg mb-4 shadow hover:bg-green-600 transition flex items-center"
      >
        <FaPlusCircle className="mr-2" /> Add New Product
      </button>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <FaSpinner className="animate-spin text-gray-500" size={36} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No products found. Click "Add New Product" to create one.
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
                  <td className="p-4 border-b">${product.price.toFixed(2)}</td>
                  <td className="p-4 border-b">
                    {categories.find((cat) => cat._id === product.categoryId)
                      ?.name || "Uncategorized"}
                  </td>
                  <td className="p-4 border-b">
                    <span
                      className={`px-2 py-1 rounded ${
                        product.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isAvailable ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4 border-b">
                    <span
                      className={`px-2 py-1 rounded ${
                        product.allowPreOrder
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.allowPreOrder ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowHistoryModal(true);
                        }}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                        title="View History"
                      >
                        <FaHistory />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setNewProductData({
                            name: product.name,
                            description: product.description,
                            price: product.price.toString(),
                            emailsText: product.emails.join(", "),
                            categoryId: product.categoryId,
                            isAvailable: product.isAvailable,
                            allowPreOrder: product.allowPreOrder,
                          });
                          setShowEditModal(true);
                        }}
                        className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <Modal
          title="Create New Product"
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateProduct}
        >
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Product Name *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newProductData.name}
                onChange={(e) =>
                  setNewProductData({ ...newProductData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newProductData.price}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    price: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Category *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newProductData.categoryId}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    categoryId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select a Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Emails *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter emails separated by commas"
                value={newProductData.emailsText}
                onChange={(e) =>
                  setNewProductData({
                    ...newProductData,
                    emailsText: e.target.value,
                  })
                }
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                At least one valid email is required
              </p>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={newProductData.isAvailable}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      isAvailable: e.target.checked,
                    })
                  }
                />
                Available
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={newProductData.allowPreOrder}
                  onChange={(e) =>
                    setNewProductData({
                      ...newProductData,
                      allowPreOrder: e.target.checked,
                    })
                  }
                />
                Allow Pre-Order
              </label>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && selectedProduct && (
        <Modal
          title="Product Details"
          onClose={() => {
            setShowEditModal(false);
            setIsEditMode(false);
          }}
          onConfirm={handleSaveEdit}
        >
          <div className="flex flex-col md:flex-row">
            {!isEditMode ? (
              <div className="w-full p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Product Details
                  </h2>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit Product
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 font-medium mb-2">
                      Product Name
                    </label>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedProduct.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-2">
                      Price
                    </label>
                    <p className="text-lg font-bold text-green-600">
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-2">
                      Category
                    </label>
                    <p className="text-lg text-gray-800">
                      {categories.find(
                        (c) => c._id === selectedProduct.categoryId
                      )?.name || "N/A"}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <div>
                      <label className="block text-gray-600 font-medium mb-2">
                        Available
                      </label>
                      <span
                        className={`px-3 py-1 rounded ${
                          selectedProduct.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedProduct.isAvailable ? "Yes" : "No"}
                      </span>
                    </div>

                    <div>
                      <label className="block text-gray-600 font-medium mb-2">
                        Pre-Order
                      </label>
                      <span
                        className={`px-3 py-1 rounded ${
                          selectedProduct.allowPreOrder
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedProduct.allowPreOrder ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-600 font-medium">
                        Emails ({selectedProduct.emails.length})
                      </label>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow max-h-60 overflow-y-auto">
                      {selectedProduct.emails.map((email, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
                        >
                          <span className="text-gray-800">{email}</span>
                          <button
                            onClick={() => {
                              setEmailToDelete(email);
                              setShowDeleteEmailModal(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Edit Product
                  </h2>
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    onClick={() => setIsEditMode(false)}
                  >
                    View Details
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newProductData.name}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newProductData.price}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Category *</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newProductData.categoryId}
                      onChange={(e) =>
                        setNewProductData({
                          ...newProductData,
                          categoryId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select a Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <form onSubmit={handleAddEmail} className="space-y-4">
                    <div>
                      <label className="block mb-2 font-medium">
                        Add New Emails (Current Count:{" "}
                        {selectedProduct?.emails.length || 0})
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter emails (comma-separated)"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={newProductData.isAvailable}
                        onChange={(e) =>
                          setNewProductData({
                            ...newProductData,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                      Available
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={newProductData.allowPreOrder}
                        onChange={(e) =>
                          setNewProductData({
                            ...newProductData,
                            allowPreOrder: e.target.checked,
                          })
                        }
                      />
                      Allow Pre-Order
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteEmailModal && (
        <Modal
          title="Delete Email"
          onClose={() => {
            setShowDeleteEmailModal(false);
            setEmailToDelete("");
          }}
          onConfirm={() => {
            handleDeleteEmail(emailToDelete);
          }}
          confirmText="Delete"
          isDanger
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete the email "{emailToDelete}"?</p>
            {isLoading && (
              <div className="flex items-center justify-center text-gray-600">
                <FaSpinner className="animate-spin mr-2" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showDeleteModal && selectedProduct && (
        <Modal
          title="Delete Product"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          confirmText="Delete"
          isDanger
        >
          <p className="text-gray-700">
            Are you sure you want to delete the product "{selectedProduct.name}
            "? This action cannot be undone.
          </p>
        </Modal>
      )}
      {showEmailConfirmModal && <EmailConfirmationModal />}

      {showHistoryModal && selectedProduct && (
        <HistoryModal
          product={selectedProduct}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}

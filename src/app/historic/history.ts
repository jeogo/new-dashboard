// types/history.ts

export interface ClientHistoryEntry {
  action: "purchase" | "preorder";
  date: Date;
  userId: string;
  fullName: string;
  email: string;
  productId: string;
  productName: string;
  price: number;
  status?: string;
  message?: string;
  responseMessage?: string;
  fulfillmentDate?: Date;
}

export interface AdminHistoryEntry {
  action: "create" | "update" | "delete";
  date: Date;
  adminId: string;
  entity: "product" | "user" | "category" | "preorder" | "notification";
  entityId: string;
  entityName?: string;
  updatedFields?: Record<string, any>;
  details?: string;
}

export interface HistoryRecord {
  _id: string;
  type: "client" | "admin";
  entry: ClientHistoryEntry | AdminHistoryEntry;
}

export interface HistoryFilters {
  type?: "client" | "admin" | "all";
  action?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface CategoryInfo {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateCategoryPayload {
  id: number;
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  updatedBy?: string;
}

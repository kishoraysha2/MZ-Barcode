export type MasterModuleName = 'categories' | 'units' | 'brands' | 'warehouses' | 'suppliers';

export interface MasterEntity {
  id: string; // UUID
  name: string;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateMasterPayload {
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateMasterPayload {
  name?: string;
  code?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MasterModuleMeta {
  moduleName: MasterModuleName;
  singularName: string;
  pluralName: string;
  description: string;
  codePrefix: string;
  tableName: string;
}

export const MASTER_MODULE_CONFIGS: Record<MasterModuleName, MasterModuleMeta> = {
  categories: {
    moduleName: 'categories',
    singularName: 'Category',
    pluralName: 'Categories',
    description: 'Product and inventory category classification',
    codePrefix: 'CAT',
    tableName: 'master_categories',
  },
  units: {
    moduleName: 'units',
    singularName: 'Unit',
    pluralName: 'Units of Measure',
    description: 'Units of measurement for stock tracking (e.g., PCS, KG, BOX)',
    codePrefix: 'UOM',
    tableName: 'master_units',
  },
  brands: {
    moduleName: 'brands',
    singularName: 'Brand',
    pluralName: 'Brands',
    description: 'Product brand and manufacturer designations',
    codePrefix: 'BRD',
    tableName: 'master_brands',
  },
  warehouses: {
    moduleName: 'warehouses',
    singularName: 'Warehouse',
    pluralName: 'Warehouses',
    description: 'Physical storage locations and distribution centers',
    codePrefix: 'WHS',
    tableName: 'master_warehouses',
  },
  suppliers: {
    moduleName: 'suppliers',
    singularName: 'Supplier',
    pluralName: 'Suppliers',
    description: 'Vendors and supply chain partners',
    codePrefix: 'SUP',
    tableName: 'master_suppliers',
  },
};

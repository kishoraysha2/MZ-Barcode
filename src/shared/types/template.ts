/**
 * MZ Barcode Suite Enterprise v1.0
 * Professional Label Template System Types
 */

export type TemplateCategory =
  | 'RETAIL'
  | 'LOGISTICS'
  | 'ASSET'
  | 'JEWELRY'
  | 'MEDICAL'
  | 'CUSTOM'
  | 'OFFICE'
  | 'WAREHOUSE';

export type ElementType =
  | 'BARCODE'
  | 'TEXT'
  | 'TEXT_BLOCK'
  | 'IMAGE'
  | 'LOGO'
  | 'QR_CODE'
  | 'RECTANGLE'
  | 'LINE'
  | 'CIRCLE';

export type Alignment = 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY';

export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export interface LabelElementProperties {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  barcodeFormat?: string;
  quietZone?: number;
  showText?: boolean;
  textPosition?: 'top' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  aspectRatio?: number;
  dataBinding?: string; // e.g., 'SKU', 'Price', 'Batch', 'Expiry', 'ProductName', 'CompanyName'
  staticValue?: string;
  imageUrl?: string;
  strokeWidth?: number;
  opacity?: number;
  [key: string]: any;
}

export interface LabelElement {
  id: string;
  templateId: string;
  type: ElementType;
  name: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  zIndex: number;
  rotation: number; // 0, 90, 180, 270
  alignment: Alignment;
  isLocked: boolean;
  isHidden: boolean;
  isPrintable: boolean;
  groupId?: string;
  properties: LabelElementProperties;
  createdAt?: string;
  updatedAt?: string;
}

export type LabelElementDTO = Omit<LabelElement, 'id' | 'templateId' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  templateId?: string;
};

export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  widthMm: number;
  heightMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  paddingMm: number;
  gapMm: number;
  orientation: Orientation;
  dpi: number;
  isSystem: boolean;
  isDefault: boolean;
  isActive: boolean;
  elements?: LabelElement[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface LabelTemplateDTO {
  name: string;
  description?: string;
  category?: TemplateCategory;
  widthMm: number;
  heightMm: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  paddingMm?: number;
  gapMm?: number;
  orientation?: Orientation;
  dpi?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface TemplateExportPackage {
  version: string;
  exportedAt: string;
  template: Omit<LabelTemplate, 'createdAt' | 'updatedAt'>;
  elements: Omit<LabelElement, 'createdAt' | 'updatedAt'>[];
}

export interface TemplateHistoryState {
  past: { template: LabelTemplate; elements: LabelElement[] }[];
  present: { template: LabelTemplate; elements: LabelElement[] };
  future: { template: LabelTemplate; elements: LabelElement[] }[];
}

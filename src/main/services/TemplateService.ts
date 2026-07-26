import { templateRepository, TemplateRepository } from '../database/repositories/TemplateRepository';
import {
  LabelTemplate,
  LabelTemplateDTO,
  LabelElement,
  LabelElementDTO,
  TemplateExportPackage,
} from '../../shared/types/template';

export class TemplateService {
  private repository: TemplateRepository;

  constructor(repository: TemplateRepository = templateRepository) {
    this.repository = repository;
  }

  /**
   * Seed read-only system templates if not already present
   */
  public initSystemTemplates(): void {
    const systemTemplatesData: Array<{
      id: string;
      dto: LabelTemplateDTO;
      elements: LabelElementDTO[];
    }> = [
      {
        id: 'sys_tpl_40x20',
        dto: {
          name: 'Standard Retail Tag (40x20mm)',
          description: 'Compact retail price tag with barcode and price binding',
          category: 'RETAIL',
          widthMm: 40,
          heightMm: 20,
          marginTopMm: 1,
          marginBottomMm: 1,
          marginLeftMm: 1,
          marginRightMm: 1,
          paddingMm: 1,
          gapMm: 0,
          orientation: 'PORTRAIT',
          dpi: 203,
          isDefault: false,
          isActive: true,
        },
        elements: [
          {
            type: 'TEXT',
            name: 'Company Name',
            xMm: 2,
            yMm: 1.5,
            widthMm: 36,
            heightMm: 3.5,
            zIndex: 0,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 8,
              fontWeight: 'bold',
              staticValue: 'MZ RETAIL STORE',
            },
          },
          {
            type: 'BARCODE',
            name: 'Product Barcode',
            xMm: 2,
            yMm: 5.5,
            widthMm: 36,
            heightMm: 9,
            zIndex: 1,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              barcodeFormat: 'CODE128',
              quietZone: 1,
              dataBinding: 'SKU',
              staticValue: '100012345',
              showText: true,
            },
          },
          {
            type: 'TEXT',
            name: 'Price Tag',
            xMm: 2,
            yMm: 15,
            widthMm: 36,
            heightMm: 4,
            zIndex: 2,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 10,
              fontWeight: 'bold',
              dataBinding: 'Price',
              staticValue: '$19.99',
            },
          },
        ],
      },
      {
        id: 'sys_tpl_50x25',
        dto: {
          name: 'Standard Product Label (50x25mm)',
          description: 'Standard product and inventory label with barcode and product title',
          category: 'RETAIL',
          widthMm: 50,
          heightMm: 25,
          marginTopMm: 1,
          marginBottomMm: 1,
          marginLeftMm: 1,
          marginRightMm: 1,
          paddingMm: 1,
          gapMm: 0,
          orientation: 'PORTRAIT',
          dpi: 203,
          isDefault: true,
          isActive: true,
        },
        elements: [
          {
            type: 'TEXT',
            name: 'Product Name',
            xMm: 2,
            yMm: 2,
            widthMm: 46,
            heightMm: 4.5,
            zIndex: 0,
            rotation: 0,
            alignment: 'LEFT',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 9,
              fontWeight: 'bold',
              dataBinding: 'ProductName',
              staticValue: 'Premium Thermal Roll 50x25',
            },
          },
          {
            type: 'BARCODE',
            name: 'Barcode Element',
            xMm: 2,
            yMm: 7,
            widthMm: 46,
            heightMm: 12,
            zIndex: 1,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              barcodeFormat: 'CODE128',
              quietZone: 2,
              dataBinding: 'SKU',
              staticValue: 'SKU-5025-8890',
              showText: true,
            },
          },
          {
            type: 'TEXT',
            name: 'Price & SKU Info',
            xMm: 2,
            yMm: 19.5,
            widthMm: 46,
            heightMm: 4,
            zIndex: 2,
            rotation: 0,
            alignment: 'RIGHT',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 9,
              fontWeight: 'bold',
              dataBinding: 'Price',
              staticValue: 'PRICE: $29.95',
            },
          },
        ],
      },
      {
        id: 'sys_tpl_60x30',
        dto: {
          name: 'Warehouse Logistics Tag (60x30mm)',
          description: 'Medium warehouse tag with QR code and batch metadata',
          category: 'WAREHOUSE',
          widthMm: 60,
          heightMm: 30,
          marginTopMm: 1.5,
          marginBottomMm: 1.5,
          marginLeftMm: 1.5,
          marginRightMm: 1.5,
          paddingMm: 1,
          gapMm: 0,
          orientation: 'PORTRAIT',
          dpi: 203,
          isDefault: false,
          isActive: true,
        },
        elements: [
          {
            type: 'QR_CODE',
            name: 'Warehouse QR',
            xMm: 2,
            yMm: 2,
            widthMm: 26,
            heightMm: 26,
            zIndex: 0,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              dataBinding: 'SKU',
              staticValue: 'WH-6030-QR-BATCH99',
            },
          },
          {
            type: 'TEXT',
            name: 'Item Title',
            xMm: 30,
            yMm: 2,
            widthMm: 28,
            heightMm: 5,
            zIndex: 1,
            rotation: 0,
            alignment: 'LEFT',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 9,
              fontWeight: 'bold',
              dataBinding: 'ProductName',
              staticValue: 'Logistics Box 60x30',
            },
          },
          {
            type: 'TEXT',
            name: 'Batch & Expiry',
            xMm: 30,
            yMm: 8,
            widthMm: 28,
            heightMm: 12,
            zIndex: 2,
            rotation: 0,
            alignment: 'LEFT',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 8,
              dataBinding: 'Batch',
              staticValue: 'Batch: B-2026-07\nExp: 2028-12',
            },
          },
        ],
      },
      {
        id: 'sys_tpl_70x40',
        dto: {
          name: 'Asset & Inventory Tag (70x40mm)',
          description: 'High visibility asset tracking label with dual barcode and asset code',
          category: 'ASSET',
          widthMm: 70,
          heightMm: 40,
          marginTopMm: 2,
          marginBottomMm: 2,
          marginLeftMm: 2,
          marginRightMm: 2,
          paddingMm: 1.5,
          gapMm: 0,
          orientation: 'PORTRAIT',
          dpi: 203,
          isDefault: false,
          isActive: true,
        },
        elements: [
          {
            type: 'TEXT',
            name: 'Header',
            xMm: 3,
            yMm: 3,
            widthMm: 64,
            heightMm: 5,
            zIndex: 0,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 10,
              fontWeight: 'bold',
              staticValue: 'PROPERTY OF ENTERPRISE CORP',
            },
          },
          {
            type: 'BARCODE',
            name: 'Asset Barcode',
            xMm: 3,
            yMm: 9,
            widthMm: 64,
            heightMm: 22,
            zIndex: 1,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              barcodeFormat: 'CODE128',
              quietZone: 2,
              dataBinding: 'SKU',
              staticValue: 'AST-7040-99812',
              showText: true,
            },
          },
        ],
      },
      {
        id: 'sys_tpl_100x50',
        dto: {
          name: 'Industrial Shipping Label (100x50mm)',
          description: 'Large pallet and shipping carton label with complete routing metadata',
          category: 'LOGISTICS',
          widthMm: 100,
          heightMm: 50,
          marginTopMm: 2,
          marginBottomMm: 2,
          marginLeftMm: 2,
          marginRightMm: 2,
          paddingMm: 2,
          gapMm: 0,
          orientation: 'PORTRAIT',
          dpi: 203,
          isDefault: false,
          isActive: true,
        },
        elements: [
          {
            type: 'TEXT',
            name: 'Shipping Header',
            xMm: 4,
            yMm: 3,
            widthMm: 92,
            heightMm: 6,
            zIndex: 0,
            rotation: 0,
            alignment: 'LEFT',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 12,
              fontWeight: 'bold',
              staticValue: 'EXPRESS FREIGHT SHIPPING',
            },
          },
          {
            type: 'BARCODE',
            name: 'Tracking Barcode',
            xMm: 4,
            yMm: 10,
            widthMm: 92,
            heightMm: 28,
            zIndex: 1,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              barcodeFormat: 'CODE128',
              quietZone: 3,
              dataBinding: 'SKU',
              staticValue: 'TRK-10050-990011',
              showText: true,
            },
          },
        ],
      },
      {
        id: 'sys_tpl_a4_sheet',
        dto: {
          name: 'A4 Sheet Labels (210x297mm Grid)',
          description: 'Standard A4 multi-label sheet layout for desktop printers',
          category: 'OFFICE',
          widthMm: 210,
          heightMm: 297,
          marginTopMm: 10,
          marginBottomMm: 10,
          marginLeftMm: 10,
          marginRightMm: 10,
          paddingMm: 2,
          gapMm: 2,
          orientation: 'PORTRAIT',
          dpi: 300,
          isDefault: false,
          isActive: true,
        },
        elements: [
          {
            type: 'TEXT',
            name: 'A4 Sheet Title',
            xMm: 10,
            yMm: 10,
            widthMm: 190,
            heightMm: 10,
            zIndex: 0,
            rotation: 0,
            alignment: 'CENTER',
            isLocked: true,
            isHidden: false,
            isPrintable: true,
            properties: {
              fontFamily: 'Arial',
              fontSize: 16,
              fontWeight: 'bold',
              staticValue: 'A4 SHEET LABEL TEMPLATE GRID',
            },
          },
        ],
      },
    ];

    for (const sys of systemTemplatesData) {
      if (!this.repository.getTemplate(sys.id)) {
        this.repository.seedSystemTemplate(
          { ...sys.dto, id: sys.id },
          sys.elements
        );
      }
    }
  }

  private sanitizeTemplate(tpl: LabelTemplate): LabelTemplate {
    if (!tpl) return tpl;
    if (!tpl.isSystem && tpl.elements) {
      tpl.elements = tpl.elements.map((el) => ({ ...el, isLocked: false }));
    } else if (tpl.isSystem && tpl.elements) {
      tpl.elements = tpl.elements.map((el) => ({ ...el, isLocked: true }));
    }
    return tpl;
  }

  public getAllTemplates(): LabelTemplate[] {
    return this.repository.getAllTemplates().map((t) => this.sanitizeTemplate(t));
  }

  public getTemplate(id: string): LabelTemplate {
    if (!id || typeof id !== 'string') {
      throw new Error('Template ID is required');
    }
    const tpl = this.repository.getTemplate(id);
    if (!tpl) {
      throw new Error(`Label template '${id}' not found`);
    }
    return this.sanitizeTemplate(tpl);
  }

  public createTemplate(dto: { template: LabelTemplateDTO; elements?: LabelElementDTO[] }): LabelTemplate {
    const { template: tplDTO, elements } = dto;
    this.validateTemplateDTO(tplDTO);

    if (this.repository.findByName(tplDTO.name)) {
      throw new Error(`A label template with the name '${tplDTO.name}' already exists.`);
    }

    const sanitizedElements = (elements || []).map((el) => ({
      ...el,
      isLocked: false,
    }));

    return this.sanitizeTemplate(this.repository.createTemplate(tplDTO, sanitizedElements));
  }

  public updateTemplate(dto: { id: string; template: Partial<LabelTemplateDTO>; elements?: LabelElementDTO[] }): LabelTemplate {
    console.log('[TRACE 4] TemplateService.updateTemplate() entered with dto ID:', dto?.id);
    const { id, template: tplDTO, elements } = dto;
    if (!id) {
      console.error('[TRACE 4.1] Template ID missing in updateTemplate');
      throw new Error('Template ID is required for update');
    }

    const existing = this.getTemplate(id);
    console.log('[TRACE 4.2] Found existing template in service:', existing.id, 'Name:', existing.name, 'isSystem:', existing.isSystem);
    if (existing.isSystem) {
      console.error('[TRACE 4.3] System template update blocked in TemplateService:', id);
      throw new Error('System templates are read-only and cannot be modified or updated.');
    }

    if (tplDTO.name && tplDTO.name !== existing.name) {
      const duplicate = this.repository.findByName(tplDTO.name);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`A label template with the name '${tplDTO.name}' already exists.`);
      }
    }

    if (tplDTO.widthMm !== undefined || tplDTO.heightMm !== undefined) {
      this.validateDimensions(
        tplDTO.widthMm !== undefined ? tplDTO.widthMm : existing.widthMm,
        tplDTO.heightMm !== undefined ? tplDTO.heightMm : existing.heightMm
      );
    }

    const sanitizedElements = elements
      ? elements.map((el) => ({
          ...el,
          isLocked: false,
        }))
      : undefined;

    console.log('[TRACE 4.4] Forwarding to TemplateRepository.updateTemplate()');
    return this.sanitizeTemplate(this.repository.updateTemplate(id, tplDTO, sanitizedElements));
  }

  public deleteTemplate(id: string): boolean {
    if (!id) {
      throw new Error('Template ID is required for deletion');
    }

    const existing = this.getTemplate(id);
    if (existing.isSystem) {
      throw new Error('System templates are read-only and cannot be deleted.');
    }

    return this.repository.deleteTemplate(id);
  }

  public duplicateTemplate(id: string, newName?: string): LabelTemplate {
    if (!id) {
      throw new Error('Template ID is required for duplication');
    }
    const dup = this.repository.duplicateTemplate(id, newName);
    return this.sanitizeTemplate(dup);
  }

  public exportTemplate(id: string): string {
    const tpl = this.getTemplate(id);
    const exportPkg: TemplateExportPackage = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      template: {
        id: tpl.id,
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        widthMm: tpl.widthMm,
        heightMm: tpl.heightMm,
        marginTopMm: tpl.marginTopMm,
        marginBottomMm: tpl.marginBottomMm,
        marginLeftMm: tpl.marginLeftMm,
        marginRightMm: tpl.marginRightMm,
        paddingMm: tpl.paddingMm,
        gapMm: tpl.gapMm,
        orientation: tpl.orientation,
        dpi: tpl.dpi,
        isSystem: false,
        isDefault: false,
        isActive: true,
        createdBy: 'EXPORT',
        updatedBy: 'EXPORT',
      },
      elements: (tpl.elements || []).map((el) => ({
        id: el.id,
        templateId: el.templateId,
        type: el.type,
        name: el.name,
        xMm: el.xMm,
        yMm: el.yMm,
        widthMm: el.widthMm,
        heightMm: el.heightMm,
        zIndex: el.zIndex,
        rotation: el.rotation,
        alignment: el.alignment,
        isLocked: el.isLocked,
        isHidden: el.isHidden,
        isPrintable: el.isPrintable,
        groupId: el.groupId,
        properties: el.properties,
      })),
    };

    return JSON.stringify(exportPkg, null, 2);
  }

  public importTemplate(jsonContent: string): LabelTemplate {
    if (!jsonContent || typeof jsonContent !== 'string') {
      throw new Error('Invalid JSON import content');
    }

    let pkg: TemplateExportPackage;
    try {
      pkg = JSON.parse(jsonContent);
    } catch (err) {
      throw new Error(`Failed to parse template JSON: ${(err as Error).message}`);
    }

    if (!pkg.template || !pkg.template.name || !pkg.template.widthMm || !pkg.template.heightMm) {
      throw new Error('Import failed: JSON package missing required template header fields (name, widthMm, heightMm)');
    }

    let importName = pkg.template.name;
    if (this.repository.findByName(importName)) {
      importName = `${importName} (Imported)`;
      let counter = 1;
      while (this.repository.findByName(importName)) {
        counter++;
        importName = `${pkg.template.name} (Imported ${counter})`;
      }
    }

    const tplDTO: LabelTemplateDTO = {
      name: importName,
      description: pkg.template.description ? `Imported: ${pkg.template.description}` : `Imported Template`,
      category: pkg.template.category || 'CUSTOM',
      widthMm: pkg.template.widthMm,
      heightMm: pkg.template.heightMm,
      marginTopMm: pkg.template.marginTopMm,
      marginBottomMm: pkg.template.marginBottomMm,
      marginLeftMm: pkg.template.marginLeftMm,
      marginRightMm: pkg.template.marginRightMm,
      paddingMm: pkg.template.paddingMm,
      gapMm: pkg.template.gapMm,
      orientation: pkg.template.orientation || 'PORTRAIT',
      dpi: pkg.template.dpi || 203,
      isDefault: false,
      isActive: true,
    };

    const elementDTOs: LabelElementDTO[] = (pkg.elements || []).map((el) => ({
      type: el.type || 'TEXT',
      name: el.name || 'Imported Element',
      xMm: el.xMm || 0,
      yMm: el.yMm || 0,
      widthMm: el.widthMm || 10,
      heightMm: el.heightMm || 10,
      zIndex: el.zIndex || 0,
      rotation: el.rotation || 0,
      alignment: el.alignment || 'LEFT',
      isLocked: false,
      isHidden: Boolean(el.isHidden),
      isPrintable: el.isPrintable !== false,
      groupId: el.groupId,
      properties: el.properties || {},
    }));

    return this.createTemplate({ template: tplDTO, elements: elementDTOs });
  }

  private validateTemplateDTO(dto: LabelTemplateDTO): void {
    if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      throw new Error('Template name is required and cannot be empty');
    }
    this.validateDimensions(dto.widthMm, dto.heightMm);
  }

  private validateDimensions(widthMm: number, heightMm: number): void {
    if (typeof widthMm !== 'number' || widthMm <= 0) {
      throw new Error('Template widthMm must be a positive number greater than 0');
    }
    if (typeof heightMm !== 'number' || heightMm <= 0) {
      throw new Error('Template heightMm must be a positive number greater than 0');
    }
  }
}

export const templateService = new TemplateService();

import { BaseRepository } from './BaseRepository';
import { dbConnection } from '../connection';
import { QueryBuilder } from '../queryBuilder';
import { migrationManager } from '../migrationManager';
import {
  LabelTemplate,
  LabelTemplateDTO,
  LabelElement,
  LabelElementDTO,
  LabelElementProperties,
  TemplateCategory,
  ElementType,
  Alignment,
  Orientation,
} from '../../../shared/types/template';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'tpl_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

function mapRowToTemplate(row: any): LabelTemplate {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description || '',
    category: (row.category as TemplateCategory) || 'CUSTOM',
    widthMm: Number(row.width_mm),
    heightMm: Number(row.height_mm),
    marginTopMm: Number(row.margin_top_mm || 0),
    marginBottomMm: Number(row.margin_bottom_mm || 0),
    marginLeftMm: Number(row.margin_left_mm || 0),
    marginRightMm: Number(row.margin_right_mm || 0),
    paddingMm: Number(row.padding_mm || 0),
    gapMm: Number(row.gap_mm || 0),
    orientation: (row.orientation as Orientation) || 'PORTRAIT',
    dpi: Number(row.dpi || 203),
    isSystem: Boolean(row.is_system),
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active ?? 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || 'SYSTEM',
    updatedBy: row.updated_by || 'SYSTEM',
  };
}

function mapRowToElement(row: any): LabelElement {
  let props: LabelElementProperties = {};
  try {
    props = row.properties_json ? JSON.parse(row.properties_json) : {};
  } catch {
    props = {};
  }

  return {
    id: String(row.id),
    templateId: String(row.template_id),
    type: (row.element_type as ElementType) || 'TEXT',
    name: row.name || 'Element',
    xMm: Number(row.x_mm || 0),
    yMm: Number(row.y_mm || 0),
    widthMm: Number(row.width_mm || 0),
    heightMm: Number(row.height_mm || 0),
    zIndex: Number(row.z_index || 0),
    rotation: Number(row.rotation || 0),
    alignment: (row.alignment as Alignment) || 'LEFT',
    isLocked: Boolean(row.is_locked),
    isHidden: Boolean(row.is_hidden),
    isPrintable: Boolean(row.is_printable ?? 1),
    groupId: row.group_id || undefined,
    properties: props,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TemplateRepository extends BaseRepository<any> {
  protected tableName = 'label_templates';

  public ensureSchema(): void {
    dbConnection.connect();
    const hasTemplates = dbConnection.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='label_templates'"
    );
    const hasElements = dbConnection.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='label_elements'"
    );

    if (!hasTemplates || !hasElements) {
      try {
        migrationManager.migrate();
      } catch (err) {
        console.warn('[TemplateRepository] migrationManager error during ensureSchema:', err);
      }

      dbConnection.exec(`
        CREATE TABLE IF NOT EXISTS label_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          category TEXT NOT NULL DEFAULT 'CUSTOM',
          width_mm REAL NOT NULL,
          height_mm REAL NOT NULL,
          margin_top_mm REAL NOT NULL DEFAULT 0,
          margin_bottom_mm REAL NOT NULL DEFAULT 0,
          margin_left_mm REAL NOT NULL DEFAULT 0,
          margin_right_mm REAL NOT NULL DEFAULT 0,
          padding_mm REAL NOT NULL DEFAULT 0,
          gap_mm REAL NOT NULL DEFAULT 0,
          orientation TEXT NOT NULL DEFAULT 'PORTRAIT',
          dpi INTEGER NOT NULL DEFAULT 203,
          is_system INTEGER NOT NULL DEFAULT 0,
          is_default INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT DEFAULT 'SYSTEM',
          updated_by TEXT DEFAULT 'SYSTEM'
        );

        CREATE TABLE IF NOT EXISTS label_elements (
          id TEXT PRIMARY KEY,
          template_id TEXT NOT NULL,
          element_type TEXT NOT NULL,
          name TEXT NOT NULL,
          x_mm REAL NOT NULL,
          y_mm REAL NOT NULL,
          width_mm REAL NOT NULL,
          height_mm REAL NOT NULL,
          z_index INTEGER NOT NULL DEFAULT 0,
          rotation REAL NOT NULL DEFAULT 0,
          alignment TEXT NOT NULL DEFAULT 'LEFT',
          is_locked INTEGER NOT NULL DEFAULT 0,
          is_hidden INTEGER NOT NULL DEFAULT 0,
          is_printable INTEGER NOT NULL DEFAULT 1,
          group_id TEXT,
          properties_json TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (template_id) REFERENCES label_templates(id) ON DELETE CASCADE
        );
      `);
    }
  }

  public getAllTemplates(): LabelTemplate[] {
    this.ensureSchema();
    try {
      const rows = QueryBuilder.select(this.tableName, ['*'], { is_active: 1 }, { orderBy: 'name ASC' });
      if (Array.isArray(rows)) {
        return rows.map((r) => {
          const tpl = mapRowToTemplate(r);
          tpl.elements = this.loadElements(tpl.id);
          if (!tpl.isSystem && tpl.elements) {
            tpl.elements = tpl.elements.map((el) => ({ ...el, isLocked: false }));
          }
          return tpl;
        });
      }
    } catch (err) {
      console.error('[TemplateRepository] Database query failed for getAllTemplates:', err);
      throw new Error(`Failed to load templates from database: ${(err as Error).message}`);
    }

    return [];
  }

  public getTemplate(id: string): LabelTemplate | null {
    this.ensureSchema();
    try {
      const row = QueryBuilder.selectOne(this.tableName, { id });
      if (row) {
        const tpl = mapRowToTemplate(row);
        tpl.elements = this.loadElements(tpl.id);
        if (!tpl.isSystem && tpl.elements) {
          tpl.elements = tpl.elements.map((el) => ({ ...el, isLocked: false }));
        }
        return tpl;
      }
      return null;
    } catch (err) {
      console.error(`[TemplateRepository] Database error loading template '${id}':`, err);
      throw new Error(`Failed to load template '${id}' from database: ${(err as Error).message}`);
    }
  }

  public findByName(name: string): LabelTemplate | null {
    this.ensureSchema();
    try {
      const row = QueryBuilder.selectOne(this.tableName, { name });
      if (row) {
        const tpl = mapRowToTemplate(row);
        tpl.elements = this.loadElements(tpl.id);
        return tpl;
      }
      return null;
    } catch (err) {
      console.error(`[TemplateRepository] Database error searching template by name '${name}':`, err);
      throw new Error(`Failed to query template by name '${name}' from database: ${(err as Error).message}`);
    }
  }

  public createTemplate(templateDTO: LabelTemplateDTO, elementsDTO: LabelElementDTO[] = []): LabelTemplate {
    return dbConnection.transaction(() => {
      const id = generateUUID();
      const now = new Date().toISOString();

      if (templateDTO.isDefault) {
        dbConnection.run(`UPDATE ${this.tableName} SET is_default = 0 WHERE 1=1`);
      }

      const dbRecord = {
        id,
        name: templateDTO.name,
        description: templateDTO.description || '',
        category: templateDTO.category || 'CUSTOM',
        width_mm: templateDTO.widthMm,
        height_mm: templateDTO.heightMm,
        margin_top_mm: templateDTO.marginTopMm || 0,
        margin_bottom_mm: templateDTO.marginBottomMm || 0,
        margin_left_mm: templateDTO.marginLeftMm || 0,
        margin_right_mm: templateDTO.marginRightMm || 0,
        padding_mm: templateDTO.paddingMm || 0,
        gap_mm: templateDTO.gapMm || 0,
        orientation: templateDTO.orientation || 'PORTRAIT',
        dpi: templateDTO.dpi || 203,
        is_system: 0,
        is_default: templateDTO.isDefault ? 1 : 0,
        is_active: templateDTO.isActive !== false ? 1 : 0,
        created_at: now,
        updated_at: now,
        created_by: 'USER',
        updated_by: 'USER',
      };

      QueryBuilder.insert(this.tableName, dbRecord);

      const createdElements = this.saveElements(id, elementsDTO);

      const template: LabelTemplate = {
        id,
        name: templateDTO.name,
        description: templateDTO.description || '',
        category: templateDTO.category || 'CUSTOM',
        widthMm: templateDTO.widthMm,
        heightMm: templateDTO.heightMm,
        marginTopMm: templateDTO.marginTopMm || 0,
        marginBottomMm: templateDTO.marginBottomMm || 0,
        marginLeftMm: templateDTO.marginLeftMm || 0,
        marginRightMm: templateDTO.marginRightMm || 0,
        paddingMm: templateDTO.paddingMm || 0,
        gapMm: templateDTO.gapMm || 0,
        orientation: templateDTO.orientation || 'PORTRAIT',
        dpi: templateDTO.dpi || 203,
        isSystem: false,
        isDefault: Boolean(templateDTO.isDefault),
        isActive: templateDTO.isActive !== false,
        elements: createdElements,
        createdAt: now,
        updatedAt: now,
        createdBy: 'USER',
        updatedBy: 'USER',
      };

      return template;
    });
  }

  public updateTemplate(id: string, templateDTO: Partial<LabelTemplateDTO>, elementsDTO?: LabelElementDTO[]): LabelTemplate {
    return dbConnection.transaction(() => {
      const existing = this.getTemplate(id);
      if (!existing) {
        throw new Error(`Label template with ID '${id}' not found`);
      }

      const now = new Date().toISOString();

      if (templateDTO.isDefault) {
        dbConnection.run(`UPDATE ${this.tableName} SET is_default = 0 WHERE 1=1`);
      }

      const updatedTemplate: LabelTemplate = {
        ...existing,
        name: templateDTO.name !== undefined ? templateDTO.name : existing.name,
        description: templateDTO.description !== undefined ? templateDTO.description : existing.description,
        category: templateDTO.category !== undefined ? templateDTO.category : existing.category,
        widthMm: templateDTO.widthMm !== undefined ? templateDTO.widthMm : existing.widthMm,
        heightMm: templateDTO.heightMm !== undefined ? templateDTO.heightMm : existing.heightMm,
        marginTopMm: templateDTO.marginTopMm !== undefined ? templateDTO.marginTopMm : existing.marginTopMm,
        marginBottomMm: templateDTO.marginBottomMm !== undefined ? templateDTO.marginBottomMm : existing.marginBottomMm,
        marginLeftMm: templateDTO.marginLeftMm !== undefined ? templateDTO.marginLeftMm : existing.marginLeftMm,
        marginRightMm: templateDTO.marginRightMm !== undefined ? templateDTO.marginRightMm : existing.marginRightMm,
        paddingMm: templateDTO.paddingMm !== undefined ? templateDTO.paddingMm : existing.paddingMm,
        gapMm: templateDTO.gapMm !== undefined ? templateDTO.gapMm : existing.gapMm,
        orientation: templateDTO.orientation !== undefined ? templateDTO.orientation : existing.orientation,
        dpi: templateDTO.dpi !== undefined ? templateDTO.dpi : existing.dpi,
        isDefault: templateDTO.isDefault !== undefined ? templateDTO.isDefault : existing.isDefault,
        isActive: templateDTO.isActive !== undefined ? templateDTO.isActive : existing.isActive,
        updatedAt: now,
      };

      const dbUpdate: Record<string, any> = {
        updated_at: now,
      };
      if (templateDTO.name !== undefined) dbUpdate.name = templateDTO.name;
      if (templateDTO.description !== undefined) dbUpdate.description = templateDTO.description;
      if (templateDTO.category !== undefined) dbUpdate.category = templateDTO.category;
      if (templateDTO.widthMm !== undefined) dbUpdate.width_mm = templateDTO.widthMm;
      if (templateDTO.heightMm !== undefined) dbUpdate.height_mm = templateDTO.heightMm;
      if (templateDTO.marginTopMm !== undefined) dbUpdate.margin_top_mm = templateDTO.marginTopMm;
      if (templateDTO.marginBottomMm !== undefined) dbUpdate.margin_bottom_mm = templateDTO.marginBottomMm;
      if (templateDTO.marginLeftMm !== undefined) dbUpdate.margin_left_mm = templateDTO.marginLeftMm;
      if (templateDTO.marginRightMm !== undefined) dbUpdate.margin_right_mm = templateDTO.marginRightMm;
      if (templateDTO.paddingMm !== undefined) dbUpdate.padding_mm = templateDTO.paddingMm;
      if (templateDTO.gapMm !== undefined) dbUpdate.gap_mm = templateDTO.gapMm;
      if (templateDTO.orientation !== undefined) dbUpdate.orientation = templateDTO.orientation;
      if (templateDTO.dpi !== undefined) dbUpdate.dpi = templateDTO.dpi;
      if (templateDTO.isDefault !== undefined) dbUpdate.is_default = templateDTO.isDefault ? 1 : 0;
      if (templateDTO.isActive !== undefined) dbUpdate.is_active = templateDTO.isActive ? 1 : 0;

      QueryBuilder.update(this.tableName, dbUpdate, { id });

      if (elementsDTO !== undefined) {
        updatedTemplate.elements = this.saveElements(id, elementsDTO);
      } else {
        updatedTemplate.elements = this.loadElements(id);
      }

      return updatedTemplate;
    });
  }

  public deleteTemplate(id: string): boolean {
    return dbConnection.transaction(() => {
      const existing = this.getTemplate(id);
      if (!existing) return false;

      QueryBuilder.delete('label_elements', { template_id: id });
      QueryBuilder.delete(this.tableName, { id });

      return true;
    });
  }

  public duplicateTemplate(id: string, newName?: string): LabelTemplate {
    return dbConnection.transaction(() => {
      const source = this.getTemplate(id);
      if (!source) {
        throw new Error(`Source label template '${id}' not found for duplication`);
      }

      let nameToUse = newName || `${source.name} (Copy)`;
      let counter = 1;
      while (this.findByName(nameToUse)) {
        counter++;
        nameToUse = `${source.name} (Copy ${counter})`;
      }

      const templateDTO: LabelTemplateDTO = {
        name: nameToUse,
        description: source.description ? `Copy of ${source.description}` : `Copy of ${source.name}`,
        category: source.category,
        widthMm: source.widthMm,
        heightMm: source.heightMm,
        marginTopMm: source.marginTopMm,
        marginBottomMm: source.marginBottomMm,
        marginLeftMm: source.marginLeftMm,
        marginRightMm: source.marginRightMm,
        paddingMm: source.paddingMm,
        gapMm: source.gapMm,
        orientation: source.orientation,
        dpi: source.dpi,
        isDefault: false,
        isActive: true,
      };

      const sourceElements = source.elements || this.loadElements(id);
      const elementDTOs: LabelElementDTO[] = sourceElements.map((el) => ({
        type: el.type,
        name: el.name,
        xMm: el.xMm,
        yMm: el.yMm,
        widthMm: el.widthMm,
        heightMm: el.heightMm,
        zIndex: el.zIndex,
        rotation: el.rotation,
        alignment: el.alignment,
        isLocked: false,
        isHidden: el.isHidden,
        isPrintable: el.isPrintable,
        groupId: el.groupId,
        properties: { ...el.properties },
      }));

      return this.createTemplate(templateDTO, elementDTOs);
    });
  }

  public saveElements(templateId: string, elements: LabelElementDTO[]): LabelElement[] {
    this.ensureSchema();
    const now = new Date().toISOString();

    dbConnection.transaction(() => {
      QueryBuilder.delete('label_elements', { template_id: templateId });

      elements.forEach((dto, idx) => {
        const elemId = dto.id || generateUUID();
        const zIndex = dto.zIndex !== undefined ? dto.zIndex : idx;

        const record = {
          id: elemId,
          template_id: templateId,
          element_type: dto.type,
          name: dto.name || `Element ${idx + 1}`,
          x_mm: dto.xMm,
          y_mm: dto.yMm,
          width_mm: dto.widthMm,
          height_mm: dto.heightMm,
          z_index: zIndex,
          rotation: dto.rotation || 0,
          alignment: dto.alignment || 'LEFT',
          is_locked: dto.isLocked ? 1 : 0,
          is_hidden: dto.isHidden ? 1 : 0,
          is_printable: dto.isPrintable !== false ? 1 : 0,
          group_id: dto.groupId || null,
          properties_json: JSON.stringify(dto.properties || {}),
          created_at: now,
          updated_at: now,
        };

        QueryBuilder.insert('label_elements', record);
      });
    });

    const reloadedElements = this.loadElements(templateId);

    if (reloadedElements.length !== elements.length) {
      throw new Error(
        `Element persistence verification failed for template '${templateId}': Database has ${reloadedElements.length} elements, expected ${elements.length}.`
      );
    }

    return reloadedElements;
  }

  public loadElements(templateId: string): LabelElement[] {
    this.ensureSchema();
    try {
      const rows = QueryBuilder.select('label_elements', ['*'], { template_id: templateId }, { orderBy: 'z_index ASC' });
      if (Array.isArray(rows)) {
        return rows.map(mapRowToElement);
      }
    } catch (err) {
      console.error(`[TemplateRepository] Failed to load elements from database for template '${templateId}':`, err);
      throw new Error(`Database read failed for template elements (ID: ${templateId}): ${(err as Error).message}`);
    }

    throw new Error(`Database read failed for template elements (ID: ${templateId})`);
  }

  public seedSystemTemplate(dto: LabelTemplateDTO & { id: string }, elements: LabelElementDTO[]): LabelTemplate {
    this.ensureSchema();
    const now = new Date().toISOString();

    const dbRecord = {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      category: dto.category || 'RETAIL',
      width_mm: dto.widthMm,
      height_mm: dto.heightMm,
      margin_top_mm: dto.marginTopMm || 0,
      margin_bottom_mm: dto.marginBottomMm || 0,
      margin_left_mm: dto.marginLeftMm || 0,
      margin_right_mm: dto.marginRightMm || 0,
      padding_mm: dto.paddingMm || 0,
      gap_mm: dto.gapMm || 0,
      orientation: dto.orientation || 'PORTRAIT',
      dpi: dto.dpi || 203,
      is_system: 1,
      is_default: dto.isDefault ? 1 : 0,
      is_active: 1,
      created_at: now,
      updated_at: now,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM',
    };

    const existing = QueryBuilder.selectOne(this.tableName, { id: dto.id });
    if (!existing) {
      QueryBuilder.insert(this.tableName, dbRecord);
    }

    const savedElements = this.saveElements(dto.id, elements);

    const template: LabelTemplate = {
      id: dto.id,
      name: dto.name,
      description: dto.description || '',
      category: dto.category || 'RETAIL',
      widthMm: dto.widthMm,
      heightMm: dto.heightMm,
      marginTopMm: dto.marginTopMm || 0,
      marginBottomMm: dto.marginBottomMm || 0,
      marginLeftMm: dto.marginLeftMm || 0,
      marginRightMm: dto.marginRightMm || 0,
      paddingMm: dto.paddingMm || 0,
      gapMm: dto.gapMm || 0,
      orientation: dto.orientation || 'PORTRAIT',
      dpi: dto.dpi || 203,
      isSystem: true,
      isDefault: Boolean(dto.isDefault),
      isActive: true,
      elements: savedElements,
      createdAt: now,
      updatedAt: now,
      createdBy: 'SYSTEM',
      updatedBy: 'SYSTEM',
    };

    return template;
  }
}

export const templateRepository = new TemplateRepository();

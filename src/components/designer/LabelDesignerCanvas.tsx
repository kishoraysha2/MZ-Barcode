import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  Maximize2,
  RefreshCcw,
  Sliders,
  Layers,
  Ruler as RulerIcon,
  MousePointer,
  Move
} from 'lucide-react';
import { LabelTemplate, LabelElement } from '../../shared/types';
import { mmToPx, pxToMm, SCREEN_DPI } from '../../utils/unitConversion';
import { useLabelDesigner } from './useLabelDesigner';
import { TransformHandles } from './TransformHandles';

export interface LabelDesignerCanvasProps {
  template: LabelTemplate;
  elements?: LabelElement[];
  onElementsChange?: (elements: LabelElement[]) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  gridSpacingMm?: number;
  onGridSpacingChange?: (spacing: number) => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  showBoundaries?: boolean;
  onToggleBoundaries?: () => void;
  className?: string;
}

export const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200, 400];
export const GRID_SPACINGS = [0.5, 1, 2, 5];

export const LabelDesignerCanvas: React.FC<LabelDesignerCanvasProps> = ({
  template,
  elements: externalElements,
  onElementsChange,
  zoom: externalZoom,
  onZoomChange,
  showGrid: externalShowGrid,
  onToggleGrid,
  gridSpacingMm: externalGridSpacing,
  onGridSpacingChange,
  showRulers: externalShowRulers,
  onToggleRulers,
  showBoundaries: externalShowBoundaries,
  onToggleBoundaries,
  className = '',
}) => {
  // Sanitize elements so custom templates are always unlocked and system templates locked
  const sanitizedInitialElements = useMemo(() => {
    const raw = externalElements && externalElements.length > 0 ? externalElements : template.elements || [];
    return raw.map((el) => ({
      ...el,
      isLocked: template.isSystem ? true : false,
    }));
  }, [externalElements, template.elements, template.isSystem]);

  // Use designer state machine hook
  const designer = useLabelDesigner({
    initialElements: sanitizedInitialElements,
    onElementsChange,
  });

  const { setElements } = designer;

  // Keep internal elements in sync when template preset changes
  const prevTemplateIdRef = useRef(template.id);
  useEffect(() => {
    if (template.id !== prevTemplateIdRef.current) {
      prevTemplateIdRef.current = template.id;
      const raw = externalElements && externalElements.length > 0 ? externalElements : template.elements || [];
      const sanitized = raw.map((el) => ({
        ...el,
        isLocked: template.isSystem ? true : false,
      }));
      setElements(sanitized);
    }
  }, [template.id, template.isSystem, externalElements, setElements]);

  // Internal view control states
  const [internalZoom, setInternalZoom] = useState<number>(100);
  const [internalShowGrid, setInternalShowGrid] = useState<boolean>(true);
  const [internalGridSpacing, setInternalGridSpacing] = useState<number>(1);
  const [internalShowRulers, setInternalShowRulers] = useState<boolean>(true);
  const [internalShowBoundaries, setInternalShowBoundaries] = useState<boolean>(true);

  // Controlled values
  const currentZoom = externalZoom !== undefined ? externalZoom : internalZoom;
  const currentShowGrid = externalShowGrid !== undefined ? externalShowGrid : internalShowGrid;
  const currentGridSpacing = externalGridSpacing !== undefined ? externalGridSpacing : internalGridSpacing;
  const currentShowRulers = externalShowRulers !== undefined ? externalShowRulers : internalShowRulers;
  const currentShowBoundaries = externalShowBoundaries !== undefined ? externalShowBoundaries : internalShowBoundaries;

  // Pan state
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cursor position over canvas (in mm)
  const [cursorMm, setCursorMm] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRootRef = useRef<SVGSVGElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dimensions
  const widthMm = template.widthMm || 50;
  const heightMm = template.heightMm || 25;

  // Scale factor: Base 1mm = 3.78px at 96 DPI, scaled by zoom %
  const basePxPerMm = pxToMm(1) > 0 ? mmToPx(1, SCREEN_DPI) : 3.7795;
  const zoomScale = currentZoom / 100;
  const pxPerMm = basePxPerMm * zoomScale;

  // Canvas size in pixels
  const canvasPxWidth = widthMm * pxPerMm;
  const canvasPxHeight = heightMm * pxPerMm;

  // Auto-calculate initial fit-to-view zoom when template or container size changes
  useEffect(() => {
    if (externalZoom !== undefined) return;
    if (!containerSize.width || !containerSize.height) return;
    const padding = 56;
    const availW = Math.max(100, containerSize.width - padding);
    const availH = Math.max(100, containerSize.height - padding);

    if (widthMm > 0 && heightMm > 0) {
      const physW = widthMm * basePxPerMm;
      const physH = heightMm * basePxPerMm;
      const scaleX = (availW * 0.85) / physW;
      const scaleY = (availH * 0.85) / physH;
      const fitScale = Math.min(scaleX, scaleY);
      const fitZoom = Math.max(25, Math.min(400, Math.round(fitScale * 100)));
      setInternalZoom(fitZoom);
    }
  }, [widthMm, heightMm, containerSize.width, containerSize.height, externalZoom]);

  // Handlers for Zoom
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      const nextZoom = ZOOM_LEVELS[currentIndex + 1];
      if (onZoomChange) onZoomChange(nextZoom);
      else setInternalZoom(nextZoom);
    } else if (currentZoom < 400) {
      const nextZoom = Math.min(400, currentZoom + 25);
      if (onZoomChange) onZoomChange(nextZoom);
      else setInternalZoom(nextZoom);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(currentZoom);
    if (currentIndex > 0) {
      const prevZoom = ZOOM_LEVELS[currentIndex - 1];
      if (onZoomChange) onZoomChange(prevZoom);
      else setInternalZoom(prevZoom);
    } else if (currentZoom > 50) {
      const prevZoom = Math.max(50, currentZoom - 25);
      if (onZoomChange) onZoomChange(prevZoom);
      else setInternalZoom(prevZoom);
    }
  };

  const handleSetZoom = (z: number) => {
    if (onZoomChange) onZoomChange(z);
    else setInternalZoom(z);
  };

  const handleToggleGrid = () => {
    if (onToggleGrid) onToggleGrid();
    else setInternalShowGrid(!internalShowGrid);
  };

  const handleGridSpacing = (s: number) => {
    if (onGridSpacingChange) onGridSpacingChange(s);
    else setInternalGridSpacing(s);
  };

  const handleToggleRulers = () => {
    if (onToggleRulers) onToggleRulers();
    else setInternalShowRulers(!internalShowRulers);
  };

  const handleToggleBoundaries = () => {
    if (onToggleBoundaries) onToggleBoundaries();
    else setInternalShowBoundaries(!internalShowBoundaries);
  };

  const handleResetPan = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  // Convert Pointer Event coordinates to Canvas millimeter coordinates
  const getPointerMm = useCallback((e: React.PointerEvent | React.MouseEvent): { x: number; y: number } => {
    if (!svgRootRef.current) return { x: 0, y: 0 };
    const rect = svgRootRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const mmX = Math.round((relX / pxPerMm) * 100) / 100;
    const mmY = Math.round((relY / pxPerMm) * 100) / 100;
    return {
      x: Math.min(Math.max(0, mmX), widthMm),
      y: Math.min(Math.max(0, mmY), heightMm),
    };
  }, [pxPerMm, widthMm, heightMm]);

  // Container Pointer / Mouse handlers
  const handlePointerDownContainer = (e: React.PointerEvent) => {
    // Middle click or Space key panning
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      designer.setInteractionMode('pan');
      return;
    }

    // Left click on empty canvas background clears selection
    if (e.button === 0 && e.target === svgRootRef.current) {
      if (!e.shiftKey) {
        designer.clearSelection();
      }
    }
  };

  const handlePointerMoveContainer = (e: React.PointerEvent) => {
    const ptMm = getPointerMm(e);
    setCursorMm(ptMm);

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // If currently dragging element
    if (designer.interactionMode === 'drag') {
      designer.updateDrag(
        ptMm.x,
        ptMm.y,
        currentShowGrid ? currentGridSpacing : 0,
        widthMm,
        heightMm
      );
    }
  };

  const handlePointerUpContainer = (e: React.PointerEvent) => {
    if (containerRef.current && 'hasPointerCapture' in containerRef.current) {
      try {
        if (containerRef.current.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        // Fallback
      }
    }

    if (isPanning) {
      setIsPanning(false);
      designer.setInteractionMode('idle');
    }
    if (designer.interactionMode === 'drag') {
      designer.endDrag();
    }
  };

  const handlePointerLeaveContainer = () => {
    setIsPanning(false);
    setCursorMm(null);
  };

  // Element Pointer Down Handler
  const handleElementPointerDown = (e: React.PointerEvent, el: LabelElement) => {
    e.stopPropagation();
    if (el.isHidden) return;

    // Capture pointer on container element so container receives pointermove & pointerup
    if (containerRef.current && 'setPointerCapture' in containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback gracefully
      }
    }

    const ptMm = getPointerMm(e);
    const activeSelectedIds = designer.selectElement(el.id, e.shiftKey);

    designer.startDrag(el.id, ptMm.x, ptMm.y, activeSelectedIds);
  };

  // Multi-selection Bounding Box Calculation
  const multiSelectBounds = useMemo(() => {
    if (designer.selectedElementIds.length <= 1) return null;

    const selectedElements = designer.elements.filter((el) =>
      designer.selectedElementIds.includes(el.id)
    );
    if (selectedElements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedElements.forEach((el) => {
      minX = Math.min(minX, el.xMm);
      minY = Math.min(minY, el.yMm);
      maxX = Math.max(maxX, el.xMm + el.widthMm);
      maxY = Math.max(maxY, el.yMm + el.heightMm);
    });

    return {
      xMm: minX,
      yMm: minY,
      widthMm: maxX - minX,
      heightMm: maxY - minY,
      xPx: minX * pxPerMm,
      yPx: minY * pxPerMm,
      widthPx: (maxX - minX) * pxPerMm,
      heightPx: (maxY - minY) * pxPerMm,
    };
  }, [designer.selectedElementIds, designer.elements, pxPerMm]);

  // Render Horizontal Ruler Marks
  const horizontalRulerMarks = useMemo(() => {
    const marks: React.ReactNode[] = [];
    const stepMm = currentGridSpacing >= 1 ? 1 : 0.5;

    for (let m = 0, i = 0; m <= widthMm + 0.001; m += stepMm, i++) {
      const roundedM = Math.round(m * 100) / 100;
      const xPx = roundedM * pxPerMm;
      const isMajor = Math.abs(roundedM % 10) < 0.001 || Math.abs(10 - (roundedM % 10)) < 0.001;
      const isMedium = Math.abs(roundedM % 5) < 0.001 || Math.abs(5 - (roundedM % 5)) < 0.001;

      let tickHeight = 6;
      if (isMajor) tickHeight = 16;
      else if (isMedium) tickHeight = 10;

      marks.push(
        <g key={`hrule-${i}-${roundedM}`}>
          <line
            x1={xPx}
            y1={28 - tickHeight}
            x2={xPx}
            y2={28}
            stroke="currentColor"
            strokeWidth={isMajor ? 1.5 : 0.75}
            className="text-slate-400 dark:text-slate-500"
          />
          {isMajor && (
            <text
              x={xPx + 2}
              y={11}
              fontSize="9"
              fontWeight="600"
              fontFamily="monospace"
              className="fill-slate-600 dark:fill-slate-400 select-none"
            >
              {Math.round(roundedM)}
            </text>
          )}
        </g>
      );
    }
    return marks;
  }, [widthMm, pxPerMm, currentGridSpacing]);

  // Render Vertical Ruler Marks
  const verticalRulerMarks = useMemo(() => {
    const marks: React.ReactNode[] = [];
    const stepMm = currentGridSpacing >= 1 ? 1 : 0.5;

    for (let m = 0, i = 0; m <= heightMm + 0.001; m += stepMm, i++) {
      const roundedM = Math.round(m * 100) / 100;
      const yPx = roundedM * pxPerMm;
      const isMajor = Math.abs(roundedM % 10) < 0.001 || Math.abs(10 - (roundedM % 10)) < 0.001;
      const isMedium = Math.abs(roundedM % 5) < 0.001 || Math.abs(5 - (roundedM % 5)) < 0.001;

      let tickWidth = 6;
      if (isMajor) tickWidth = 16;
      else if (isMedium) tickWidth = 10;

      marks.push(
        <g key={`vrule-${i}-${roundedM}`}>
          <line
            x1={28 - tickWidth}
            y1={yPx}
            x2={28}
            y2={yPx}
            stroke="currentColor"
            strokeWidth={isMajor ? 1.5 : 0.75}
            className="text-slate-400 dark:text-slate-500"
          />
          {isMajor && (
            <text
              x={10}
              y={yPx - 2}
              fontSize="9"
              fontWeight="600"
              fontFamily="monospace"
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-400 select-none"
              transform={`rotate(-90 10 ${yPx - 2})`}
            >
              {Math.round(roundedM)}
            </text>
          )}
        </g>
      );
    }
    return marks;
  }, [heightMm, pxPerMm, currentGridSpacing]);

  // Helper to render interactive SVG element
  const renderElement = (el: LabelElement, index: number) => {
    if (el.isHidden) return null;

    const x = el.xMm * pxPerMm;
    const y = el.yMm * pxPerMm;
    const w = el.widthMm * pxPerMm;
    const h = el.heightMm * pxPerMm;
    const rot = el.rotation || 0;

    const isSelected = designer.selectedElementIds.includes(el.id);
    const isHovered = designer.hoveredElementId === el.id;
    const transform = `translate(${x}, ${y}) rotate(${rot} ${w / 2} ${h / 2})`;

    let elementContent: React.ReactNode = null;

    switch (el.type) {
      case 'TEXT':
      case 'TEXT_BLOCK': {
        const fontSizePx = (el.properties?.fontSize || 10) * (pxPerMm / basePxPerMm);
        const textContent = el.properties?.staticValue || el.name || 'Text Placeholder';
        const fontWeight = el.properties?.fontWeight || 'normal';
        const color = el.properties?.color || '#000000';

        elementContent = (
          <g transform={transform} opacity={el.isLocked ? 0.7 : 1}>
            <rect width={w} height={h} fill="transparent" />
            <text
              x={w / 2}
              y={h / 2 + fontSizePx / 3}
              textAnchor="middle"
              fontSize={fontSizePx}
              fontWeight={fontWeight}
              fill={color}
              fontFamily={el.properties?.fontFamily || 'sans-serif'}
              className="select-none"
            >
              {textContent}
            </text>
          </g>
        );
        break;
      }

      case 'BARCODE': {
        const barcodeVal = el.properties?.staticValue || '123456789';
        const showText = el.properties?.showText !== false;
        elementContent = (
          <g transform={transform}>
            <rect width={w} height={h} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" rx="2" />
            <g transform={`translate(${w * 0.05}, ${h * 0.1}) scale(${w * 0.9 / 200}, ${h * (showText ? 0.65 : 0.8) / 40})`}>
              <rect x="5" y="0" width="4" height="35" fill="#000" />
              <rect x="12" y="0" width="2" height="35" fill="#000" />
              <rect x="17" y="0" width="6" height="35" fill="#000" />
              <rect x="26" y="0" width="3" height="35" fill="#000" />
              <rect x="32" y="0" width="8" height="35" fill="#000" />
              <rect x="44" y="0" width="3" height="35" fill="#000" />
              <rect x="52" y="0" width="5" height="35" fill="#000" />
              <rect x="62" y="0" width="2" height="35" fill="#000" />
              <rect x="67" y="0" width="7" height="35" fill="#000" />
              <rect x="78" y="0" width="4" height="35" fill="#000" />
              <rect x="85" y="0" width="2" height="35" fill="#000" />
              <rect x="90" y="0" width="6" height="35" fill="#000" />
              <rect x="100" y="0" width="3" height="35" fill="#000" />
              <rect x="108" y="0" width="8" height="35" fill="#000" />
              <rect x="120" y="0" width="2" height="35" fill="#000" />
              <rect x="126" y="0" width="5" height="35" fill="#000" />
              <rect x="135" y="0" width="3" height="35" fill="#000" />
              <rect x="143" y="0" width="6" height="35" fill="#000" />
              <rect x="153" y="0" width="4" height="35" fill="#000" />
              <rect x="160" y="0" width="2" height="35" fill="#000" />
              <rect x="166" y="0" width="8" height="35" fill="#000" />
              <rect x="178" y="0" width="3" height="35" fill="#000" />
              <rect x="185" y="0" width="5" height="35" fill="#000" />
            </g>
            {showText && (
              <text
                x={w / 2}
                y={h - 2}
                textAnchor="middle"
                fontSize={Math.max(8, h * 0.18)}
                fontFamily="monospace"
                fontWeight="bold"
                fill="#000000"
                className="select-none"
              >
                {barcodeVal}
              </text>
            )}
          </g>
        );
        break;
      }

      case 'QR_CODE': {
        elementContent = (
          <g transform={transform}>
            <rect width={w} height={h} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" rx="2" />
            <g transform={`scale(${w / 100}, ${h / 100})`}>
              <rect x="10" y="10" width="25" height="25" fill="#000" />
              <rect x="15" y="15" width="15" height="15" fill="#fff" />
              <rect x="20" y="20" width="5" height="5" fill="#000" />
              <rect x="65" y="10" width="25" height="25" fill="#000" />
              <rect x="70" y="15" width="15" height="15" fill="#fff" />
              <rect x="75" y="20" width="5" height="5" fill="#000" />
              <rect x="10" y="65" width="25" height="25" fill="#000" />
              <rect x="15" y="70" width="15" height="15" fill="#fff" />
              <rect x="20" y="75" width="5" height="5" fill="#000" />
              <rect x="42" y="15" width="6" height="6" fill="#000" />
              <rect x="52" y="25" width="6" height="6" fill="#000" />
              <rect x="42" y="42" width="16" height="16" fill="#000" />
              <rect x="65" y="42" width="10" height="10" fill="#000" />
              <rect x="42" y="65" width="12" height="12" fill="#000" />
              <rect x="60" y="65" width="25" height="25" fill="#000" />
            </g>
          </g>
        );
        break;
      }

      case 'RECTANGLE': {
        const borderWidth = (el.properties?.borderWidth || 1) * (pxPerMm / basePxPerMm);
        const borderColor = el.properties?.borderColor || '#000000';
        const bgColor = el.properties?.backgroundColor || 'none';
        elementContent = (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
            rx={el.properties?.borderRadius || 0}
            transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}
          />
        );
        break;
      }

      case 'LINE': {
        const strokeWidth = (el.properties?.strokeWidth || 1) * (pxPerMm / basePxPerMm);
        const color = el.properties?.color || '#000000';
        elementContent = (
          <line
            x1={x}
            y1={y}
            x2={x + w}
            y2={y + h}
            stroke={color}
            strokeWidth={strokeWidth}
            transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}
          />
        );
        break;
      }

      case 'CIRCLE': {
        const borderColor = el.properties?.borderColor || '#000000';
        const bgColor = el.properties?.backgroundColor || 'none';
        const strokeWidth = (el.properties?.borderWidth || 1) * (pxPerMm / basePxPerMm);
        elementContent = (
          <ellipse
            cx={x + w / 2}
            cy={y + h / 2}
            rx={w / 2}
            ry={h / 2}
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
          />
        );
        break;
      }

      default:
        elementContent = (
          <g transform={transform}>
            <rect width={w} height={h} fill="#f1f5f9" stroke="#94a3b8" strokeDasharray="3 3" rx="2" />
            <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize="10" fill="#64748b" className="select-none font-bold">
              [{el.name || el.type}]
            </text>
          </g>
        );
    }

    return (
      <g
        key={el.id ? `el-${el.id}-${index}` : `el-idx-${index}`}
        className="cursor-move"
        style={{ transition: designer.interactionMode === 'drag' ? 'none' : undefined }}
        onPointerDown={(e) => handleElementPointerDown(e, el)}
        onPointerEnter={() => designer.setHoveredElementId(el.id)}
        onPointerLeave={() => designer.setHoveredElementId(null)}
      >
        {elementContent}

        {/* Transform Bounding Box Handles for Single Selection */}
        {designer.selectedElementIds.length <= 1 && (
          <TransformHandles
            x={x}
            y={y}
            width={w}
            height={h}
            rotation={rot}
            isSelected={isSelected}
            isHovered={isHovered}
            elementName={el.name}
            xMm={el.xMm}
            yMm={el.yMm}
            widthMm={el.widthMm}
            heightMm={el.heightMm}
            isLocked={el.isLocked}
          />
        )}
      </g>
    );
  };

  return (
    <div className={`flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-900 text-slate-100 overflow-hidden shadow-xl ${className}`}>
      {/* Top Toolbar Bar */}
      <div className="bg-slate-950 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Controls: Zoom, Grid Spacing, Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition"
              title="Zoom Out (-25%)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            {/* Zoom Selector Dropdown */}
            <select
              value={currentZoom}
              onChange={(e) => handleSetZoom(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-mono font-bold px-1.5 py-1 text-xs focus:outline-none cursor-pointer"
            >
              {ZOOM_LEVELS.map((z) => (
                <option key={z} value={z} className="bg-slate-900 text-slate-100">
                  {z}%
                </option>
              ))}
            </select>

            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition"
              title="Zoom In (+25%)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Grid Toggle & Spacing */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1.5">
            <button
              onClick={handleToggleGrid}
              className={`p-1 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                currentShowGrid
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              Grid
            </button>

            {currentShowGrid && (
              <select
                value={currentGridSpacing}
                onChange={(e) => handleGridSpacing(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none"
              >
                {GRID_SPACINGS.map((gs) => (
                  <option key={gs} value={gs}>
                    {gs} mm
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ruler Toggle */}
          <button
            onClick={handleToggleRulers}
            className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              currentShowRulers
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RulerIcon className="h-3.5 w-3.5" />
            Rulers
          </button>

          {/* Boundaries Toggle */}
          <button
            onClick={handleToggleBoundaries}
            className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              currentShowBoundaries
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Boundaries
          </button>
        </div>

        {/* Right Info: Dimensions & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] font-mono">
            <span className="text-slate-400">Mode:</span>
            <span className="text-amber-400 font-bold uppercase">{designer.interactionMode}</span>
            {designer.selectedElementIds.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {designer.selectedElementIds.length} Selected
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Label Size:{' '}
            <span className="text-amber-400 font-bold">
              {widthMm} × {heightMm} mm
            </span>
          </div>

          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              onClick={handleResetPan}
              className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold flex items-center gap-1"
              title="Reset Pan Center"
            >
              <RefreshCcw className="h-3 w-3" /> Reset View
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDownContainer}
        onPointerMove={handlePointerMoveContainer}
        onPointerUp={handlePointerUpContainer}
        onPointerLeave={handlePointerLeaveContainer}
        className={`relative flex-1 min-h-[460px] bg-slate-950 overflow-hidden select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* Top Horizontal Ruler Container */}
        {currentShowRulers && (
          <div
            className="absolute top-0 left-0 right-0 h-7 bg-slate-900/90 backdrop-blur-xs border-b border-slate-800 z-20 pointer-events-none"
            style={{ paddingLeft: `${28}px` }}
          >
            <svg className="w-full h-full overflow-visible">
              <g
                transform={`translate(${
                  (containerSize.width - 28 - canvasPxWidth) / 2 + panOffset.x
                }, 0)`}
              >
                {horizontalRulerMarks}

                {/* Realtime Mouse Cursor Tick Indicator on Top Ruler */}
                {cursorMm !== null && (
                  <g transform={`translate(${cursorMm.x * pxPerMm}, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="28" stroke="#f59e0b" strokeWidth="2" />
                    <rect x="-14" y="2" width="28" height="12" fill="#f59e0b" rx="2" />
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#000"
                      fontFamily="monospace"
                    >
                      {cursorMm.x.toFixed(1)}
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>
        )}

        {/* Left Vertical Ruler Container */}
        {currentShowRulers && (
          <div
            className="absolute top-0 left-0 bottom-0 w-7 bg-slate-900/90 backdrop-blur-xs border-r border-slate-800 z-20 pointer-events-none"
            style={{ paddingTop: `${28}px` }}
          >
            <svg className="w-full h-full overflow-visible">
              <g
                transform={`translate(0, ${
                  (containerSize.height - 28 - canvasPxHeight) / 2 + panOffset.y
                })`}
              >
                {verticalRulerMarks}

                {/* Realtime Mouse Cursor Tick Indicator on Left Ruler */}
                {cursorMm !== null && (
                  <g transform={`translate(0, ${cursorMm.y * pxPerMm})`}>
                    <line x1="0" y1="0" x2="28" y2="0" stroke="#f59e0b" strokeWidth="2" />
                    <rect x="2" y="-12" width="24" height="12" fill="#f59e0b" rx="2" />
                    <text
                      x="14"
                      y="-3"
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#000"
                      fontFamily="monospace"
                    >
                      {cursorMm.y.toFixed(1)}
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>
        )}

        {/* Corner Square Junction */}
        {currentShowRulers && (
          <div className="absolute top-0 left-0 w-7 h-7 bg-slate-900 border-r border-b border-slate-800 z-30 flex items-center justify-center">
            <span className="text-[9px] font-mono text-amber-500 font-bold">mm</span>
          </div>
        )}

        {/* Centered Canvas Container */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            designer.interactionMode === 'drag' || isPanning ? '' : 'transition-transform duration-75'
          }`}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            paddingLeft: currentShowRulers ? '28px' : '0px',
            paddingTop: currentShowRulers ? '28px' : '0px',
            transition: designer.interactionMode === 'drag' || isPanning ? 'none' : undefined,
          }}
        >
          {/* Main SVG Label Stock Canvas */}
          <div className="relative shadow-2xl rounded-sm">
            <svg
              ref={svgRootRef}
              id="label-svg-root"
              width={canvasPxWidth}
              height={canvasPxHeight}
              viewBox={`0 0 ${canvasPxWidth} ${canvasPxHeight}`}
              className="bg-white text-slate-900 rounded-sm overflow-hidden border border-slate-300 shadow-2xl block"
            >
              <defs>
                {/* SVG Grid Pattern */}
                <pattern
                  id="label-grid-pattern"
                  width={currentGridSpacing * pxPerMm}
                  height={currentGridSpacing * pxPerMm}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${currentGridSpacing * pxPerMm} 0 L 0 0 0 ${currentGridSpacing * pxPerMm}`}
                    fill="none"
                    stroke="rgba(203, 213, 225, 0.6)"
                    strokeWidth="0.75"
                  />
                </pattern>
              </defs>

              {/* Background Grid Fill */}
              {currentShowGrid && (
                <rect width="100%" height="100%" fill="url(#label-grid-pattern)" />
              )}

              {/* BOUNDARY FRAMES */}
              {currentShowBoundaries && (
                <g id="boundaries-group">
                  {/* Outer Printable Label Boundary */}
                  <rect
                    x="0"
                    y="0"
                    width={canvasPxWidth}
                    height={canvasPxHeight}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />

                  {/* Margin Boundary (Inner Dashed Red Line) */}
                  {(() => {
                    const marginTopPx = (template.marginTopMm || 0) * pxPerMm;
                    const marginBottomPx = (template.marginBottomMm || 0) * pxPerMm;
                    const marginLeftPx = (template.marginLeftMm || 0) * pxPerMm;
                    const marginRightPx = (template.marginRightMm || 0) * pxPerMm;

                    const marginWidth = canvasPxWidth - marginLeftPx - marginRightPx;
                    const marginHeight = canvasPxHeight - marginTopPx - marginBottomPx;

                    if (marginWidth > 0 && marginHeight > 0) {
                      return (
                        <rect
                          x={marginLeftPx}
                          y={marginTopPx}
                          width={marginWidth}
                          height={marginHeight}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1.25"
                          strokeDasharray="4 3"
                        />
                      );
                    }
                    return null;
                  })()}
                </g>
              )}

              {/* INTERACTIVE TEMPLATE ELEMENTS */}
              <g id="elements-group">
                {designer.elements.map((el, idx) => renderElement(el, idx))}
              </g>

              {/* Multi-Selection Bounding Box Overlay */}
              {multiSelectBounds && (
                <TransformHandles
                  x={multiSelectBounds.xPx}
                  y={multiSelectBounds.yPx}
                  width={multiSelectBounds.widthPx}
                  height={multiSelectBounds.heightPx}
                  isSelected={true}
                  isMultiSelect={true}
                  xMm={multiSelectBounds.xMm}
                  yMm={multiSelectBounds.yMm}
                  widthMm={multiSelectBounds.widthMm}
                  heightMm={multiSelectBounds.heightMm}
                />
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Left Canvas Legend Overlay */}
        <div className="absolute bottom-3 left-10 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Label Stock</span>
          </div>

          <div className="flex items-center gap-1">
            <MousePointer className="h-3 w-3 text-amber-400" />
            <span>Click element to select (Shift+Click multi)</span>
          </div>

          <div className="flex items-center gap-1">
            <Move className="h-3 w-3 text-blue-400" />
            <span>Drag to move ({currentGridSpacing}mm snap)</span>
          </div>

          <div className="text-slate-500 pl-1 border-l border-slate-800">
            Middle-click to Pan
          </div>
        </div>
      </div>
    </div>
  );
};


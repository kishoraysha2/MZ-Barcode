import { useState, useCallback, useRef, useEffect } from 'react';
import { LabelElement } from '../../shared/types';

export type InteractionMode = 'idle' | 'pan' | 'select' | 'drag' | 'resize';

export interface DragStartInfo {
  startPointerMmX: number;
  startPointerMmY: number;
  initialElementPositions: Map<string, { xMm: number; yMm: number }>;
}

export interface UseLabelDesignerProps {
  initialElements?: LabelElement[];
  onElementsChange?: (elements: LabelElement[]) => void;
}

export interface UseLabelDesignerReturn {
  elements: LabelElement[];
  setElements: React.Dispatch<React.SetStateAction<LabelElement[]>>;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  draggingElementId: string | null;
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  setHoveredElementId: (id: string | null) => void;
  selectElement: (id: string, isShiftPressed: boolean) => string[];
  clearSelection: () => void;
  startDrag: (elementId: string, pointerMmX: number, pointerMmY: number, activeSelectedIds?: string[]) => void;
  updateDrag: (pointerMmX: number, pointerMmY: number, gridSnapMm: number, widthMm?: number, heightMm?: number) => void;
  endDrag: () => void;
  updateElementPosition: (id: string, xMm: number, yMm: number) => void;
}

export const useLabelDesigner = ({
  initialElements = [],
  onElementsChange,
}: UseLabelDesignerProps = {}): UseLabelDesignerReturn => {
  const [elements, setElementsState] = useState<LabelElement[]>(initialElements);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');

  // Refs for synchronous snapshots without stale closures
  const selectedElementIdsRef = useRef<string[]>(selectedElementIds);
  useEffect(() => {
    selectedElementIdsRef.current = selectedElementIds;
  }, [selectedElementIds]);

  const elementsRef = useRef<LabelElement[]>(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Ref to hold drag state across moves without triggering unnecessary re-renders
  const dragInfoRef = useRef<DragStartInfo | null>(null);

  // Wrapper for updating elements state
  const setElements: React.Dispatch<React.SetStateAction<LabelElement[]>> = useCallback((action) => {
    setElementsState(action);
  }, []);

  // Safely notify parent onElementsChange after render commit
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onElementsChange) {
      onElementsChange(elements);
    }
  }, [elements, onElementsChange]);

  // Selection Handler - owns all selection modifications
  const selectElement = useCallback((id: string, isShiftPressed: boolean): string[] => {
    const prev = selectedElementIdsRef.current;
    let next: string[];
    if (isShiftPressed) {
      if (prev.includes(id)) {
        // Deselect if already selected
        next = prev.filter((item) => item !== id);
      } else {
        // Add to selection
        next = [...prev, id];
      }
    } else {
      // If element is already part of multi-selection, retain selection for dragging group
      if (prev.includes(id)) {
        next = prev;
      } else {
        next = [id];
      }
    }
    selectedElementIdsRef.current = next;
    setSelectedElementIds(next);
    return next;
  }, []);

  const clearSelection = useCallback(() => {
    selectedElementIdsRef.current = [];
    setSelectedElementIds([]);
  }, []);

  // Drag Initiation - NEVER modifies selectedElementIds
  const startDrag = useCallback(
    (elementId: string, pointerMmX: number, pointerMmY: number, activeSelectedIds?: string[]) => {
      const targetIds = activeSelectedIds || selectedElementIdsRef.current;
      const effectiveTargetIds = targetIds.length > 0 ? targetIds : [elementId];

      setDraggingElementId(elementId);
      setInteractionMode('drag');

      // Store starting positions of all target elements immutably
      const initialMap = new Map<string, { xMm: number; yMm: number }>();
      elementsRef.current.forEach((el) => {
        if (effectiveTargetIds.includes(el.id)) {
          initialMap.set(el.id, { xMm: el.xMm, yMm: el.yMm });
        }
      });

      dragInfoRef.current = {
        startPointerMmX: pointerMmX,
        startPointerMmY: pointerMmY,
        initialElementPositions: initialMap,
      };
    },
    []
  );

  // Drag Update with Grid Snapping
  const updateDrag = useCallback((
    pointerMmX: number,
    pointerMmY: number,
    gridSnapMm: number,
    widthMm?: number,
    heightMm?: number
  ) => {
    if (!dragInfoRef.current) return;

    const { startPointerMmX, startPointerMmY, initialElementPositions } = dragInfoRef.current;
    const deltaMmX = pointerMmX - startPointerMmX;
    const deltaMmY = pointerMmY - startPointerMmY;

    setElements((prevElements) => {
      return prevElements.map((el) => {
        const initialPos = initialElementPositions.get(el.id);
        if (!initialPos || el.isLocked) return el;

        let snappedDeltaX = deltaMmX;
        let snappedDeltaY = deltaMmY;

        // Apply Grid Snap to the delta so off-grid start offset is preserved
        if (gridSnapMm > 0) {
          snappedDeltaX = Math.round(deltaMmX / gridSnapMm) * gridSnapMm;
          snappedDeltaY = Math.round(deltaMmY / gridSnapMm) * gridSnapMm;
        }

        let rawX = initialPos.xMm + snappedDeltaX;
        let rawY = initialPos.yMm + snappedDeltaY;

        // Round to 2 decimal places for clean precision
        rawX = Math.round(rawX * 100) / 100;
        rawY = Math.round(rawY * 100) / 100;

        // Optional boundary constraint
        if (widthMm !== undefined) {
          rawX = Math.max(0, Math.min(widthMm - el.widthMm, rawX));
        }
        if (heightMm !== undefined) {
          rawY = Math.max(0, Math.min(heightMm - el.heightMm, rawY));
        }

        return {
          ...el,
          xMm: rawX,
          yMm: rawY,
        };
      });
    });
  }, [setElements]);

  // End Drag
  const endDrag = useCallback(() => {
    setDraggingElementId(null);
    setInteractionMode('idle');
    dragInfoRef.current = null;
  }, []);

  // Update single position directly
  const updateElementPosition = useCallback((id: string, xMm: number, yMm: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, xMm, yMm } : el))
    );
  }, [setElements]);

  return {
    elements,
    setElements,
    selectedElementIds,
    hoveredElementId,
    draggingElementId,
    interactionMode,
    setInteractionMode,
    setHoveredElementId,
    selectElement,
    clearSelection,
    startDrag,
    updateDrag,
    endDrag,
    updateElementPosition,
  };
};

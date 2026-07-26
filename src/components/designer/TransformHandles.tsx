import React from 'react';

export interface TransformHandlesProps {
  x: number; // in px
  y: number; // in px
  width: number; // in px
  height: number; // in px
  rotation?: number; // in degrees
  isSelected?: boolean;
  isHovered?: boolean;
  isMultiSelect?: boolean;
  elementName?: string;
  widthMm?: number;
  heightMm?: number;
  xMm?: number;
  yMm?: number;
  isLocked?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const TransformHandles: React.FC<TransformHandlesProps> = ({
  x,
  y,
  width,
  height,
  rotation = 0,
  isSelected = false,
  isHovered = false,
  isMultiSelect = false,
  elementName = '',
  widthMm,
  heightMm,
  xMm,
  yMm,
  isLocked = false,
  onMouseDown,
}) => {
  if (!isSelected && !isHovered) return null;

  const handleSize = 8;
  const halfHandle = handleSize / 2;

  // Handles positions relative to bounding box top-left
  const handles = [
    { id: 'tl', cx: 0, cy: 0, cursor: 'nwse-resize' },
    { id: 'tm', cx: width / 2, cy: 0, cursor: 'ns-resize' },
    { id: 'tr', cx: width, cy: 0, cursor: 'nesw-resize' },
    { id: 'mr', cx: width, cy: height / 2, cursor: 'ew-resize' },
    { id: 'br', cx: width, cy: height, cursor: 'nwse-resize' },
    { id: 'bm', cx: width / 2, cy: height, cursor: 'ns-resize' },
    { id: 'bl', cx: 0, cy: height, cursor: 'nesw-resize' },
    { id: 'ml', cx: 0, cy: height / 2, cursor: 'ew-resize' },
  ];

  const transform = `translate(${x}, ${y}) rotate(${rotation} ${width / 2} ${height / 2})`;

  return (
    <g transform={transform} className="pointer-events-none select-none">
      {/* Hover Outline */}
      {isHovered && !isSelected && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="transition-opacity"
        />
      )}

      {/* Selected Bounding Box */}
      {isSelected && (
        <>
          {/* Outer Glow / Boundary Rect */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="rgba(245, 158, 11, 0.06)"
            stroke={isMultiSelect ? '#3b82f6' : '#f59e0b'}
            strokeWidth="1.75"
            className="pointer-events-auto cursor-move"
            onMouseDown={onMouseDown}
          />

          {/* Corner & Edge Handles */}
          {!isLocked &&
            handles.map((h) => (
              <rect
                key={h.id}
                x={h.cx - halfHandle}
                y={h.cy - halfHandle}
                width={handleSize}
                height={handleSize}
                fill="#ffffff"
                stroke={isMultiSelect ? '#3b82f6' : '#f59e0b'}
                strokeWidth="1.75"
                rx="1.5"
                className="pointer-events-auto shadow-md"
                style={{ cursor: h.cursor }}
              />
            ))}

          {/* Dimension / Coordinates Indicator Badge */}
          {widthMm !== undefined && heightMm !== undefined && (
            <g transform={`translate(${width / 2}, ${height + 16})`}>
              <rect
                x="-42"
                y="-10"
                width="84"
                height="18"
                fill="#0f172a"
                rx="4"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                fill="#f59e0b"
              >
                {widthMm}×{heightMm}mm
              </text>
            </g>
          )}

          {/* Name & Coordinates Tag when single selection */}
          {xMm !== undefined && yMm !== undefined && (
            <g transform={`translate(0, -10)`}>
              <rect
                x="0"
                y="-12"
                width={Math.max(60, (elementName || 'Element').length * 6 + 28)}
                height="15"
                fill="#0f172a"
                rx="3"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x="6"
                y="-1"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                fill="#e2e8f0"
              >
                {elementName || 'EL'} ({xMm.toFixed(1)},{yMm.toFixed(1)})
              </text>
            </g>
          )}
        </>
      )}
    </g>
  );
};


import React, { useState, useRef, useEffect } from 'react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number, height: number };
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

const Window: React.FC<WindowProps> = ({ id, title, children, initialPosition, initialSize, zIndex, onClose, onMinimize, onFocus }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag via title bar
    if (!(e.target as HTMLElement).classList.contains('title-bar-drag-handle')) {
        return;
    }
    onFocus();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      let newX = e.clientX - dragStartPos.current.x;
      let newY = e.clientY - dragStartPos.current.y;

      // Clamp position to be within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const windowWidth = windowRef.current?.offsetWidth ?? 0;
      
      newX = Math.max(0, Math.min(newX, viewportWidth - windowWidth));
      newY = Math.max(0, Math.min(newY, viewportHeight - 30)); // 30px for taskbar

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={windowRef}
      className="w95-outset absolute bg-[#c0c0c0] p-1 flex flex-col shadow-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${initialSize.width}px`,
        height: `${initialSize.height}px`,
        zIndex: zIndex,
      }}
      onMouseDown={onFocus}
    >
      <div
        className="title-bar-drag-handle bg-gradient-to-r from-[#000080] to-[#1084d0] text-white p-1 flex justify-between items-center font-bold cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1">
            <span dangerouslySetInnerHTML={{ __html: title.split(' ')[0] }}></span>
            <span>{title.substring(title.indexOf(' ') + 1)}</span>
        </div>
        <div className="flex items-center">
          <button onClick={onMinimize} className="w95-button bg-[#c0c0c0] w-4 h-4 flex items-center justify-center font-mono text-xs text-black mr-1">
            _
          </button>
          <button onClick={onClose} className="w95-button bg-[#c0c0c0] w-4 h-4 flex items-center justify-center font-mono text-xs text-black">
            x
          </button>
        </div>
      </div>
      <div className="p-1 flex-grow overflow-auto bg-white w95-inset">
        {children}
      </div>
    </div>
  );
};

export default Window;
"use client";

import { useState, useRef } from "react";

export type DropPosition = "above" | "below" | null;

export function useDragSort(onReorder: (draggedId: string, targetId: string, position: DropPosition) => void) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const dragCounter = useRef(0);

  function handleDragStart(e: React.DragEvent, itemId: string) {
    setDraggedId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
    if (e.currentTarget instanceof HTMLElement) {
      requestAnimationFrame(() => {
        (e.target as HTMLElement).style.opacity = "0.4";
      });
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
    dragCounter.current = 0;
  }

  function handleDragEnter(e: React.DragEvent, itemId: string) {
    e.preventDefault();
    dragCounter.current++;
    if (itemId !== draggedId) {
      setDropTargetId(itemId);
    }
  }

  function handleDragLeave() {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  }

  function handleDragOver(e: React.DragEvent, itemId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (itemId === draggedId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropPosition(e.clientY < midY ? "above" : "below");
    setDropTargetId(itemId);
  }

  function handleDrop(e: React.DragEvent, targetItemId: string) {
    e.preventDefault();
    dragCounter.current = 0;

    if (!draggedId || draggedId === targetItemId) {
      setDraggedId(null);
      setDropTargetId(null);
      setDropPosition(null);
      return;
    }

    onReorder(draggedId, targetItemId, dropPosition);

    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  }

  return {
    draggedId,
    dropTargetId,
    dropPosition,
    handlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

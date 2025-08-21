"use client";
import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({
  src,
  alt,
  isOpen,
  onClose,
}: ImageModalProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen, onClose]);

  // Reset scale when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  console.log(src);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-full max-h-full">
        {/* Header Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div
          className="transition-transform duration-200 ease-in-out bg-red-500"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={src}
            alt={alt}
            className="object-contain max-w-[90vw] max-h-[90vh] rounded-lg"
            onLoad={() => console.log("✅ Modal image loaded:", src)}
            onError={() => console.error("❌ Modal image failed:", src)}
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <p className="text-sm font-medium">{alt}</p>
          <p className="text-xs opacity-70">
            Click outside to close • Scroll to zoom
          </p>
        </div>
      </div>
    </div>
  );
}

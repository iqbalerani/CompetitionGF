import React from 'react';
import { X } from 'lucide-react';
import { useImageZoom } from '../contexts/ImageZoomContext';

const ImagePreviewModal: React.FC = () => {
  const { zoomedImage, setZoomedImage } = useImageZoom();

  if (!zoomedImage) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setZoomedImage(null)}
    >
      <button 
        onClick={() => setZoomedImage(null)}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X size={24} />
      </button>
      <div className="relative max-w-[95vw] max-h-[95vh] p-2 flex items-center justify-center">
        <img 
          src={zoomedImage} 
          alt="Zoomed Preview" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
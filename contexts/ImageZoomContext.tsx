import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageZoomContextType {
  zoomedImage: string | null;
  setZoomedImage: (url: string | null) => void;
}

const ImageZoomContext = createContext<ImageZoomContextType | undefined>(undefined);

export const ImageZoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <ImageZoomContext.Provider value={{ zoomedImage, setZoomedImage }}>
      {children}
    </ImageZoomContext.Provider>
  );
};

export const useImageZoom = () => {
  const context = useContext(ImageZoomContext);
  if (!context) {
    throw new Error('useImageZoom must be used within an ImageZoomProvider');
  }
  return context;
};
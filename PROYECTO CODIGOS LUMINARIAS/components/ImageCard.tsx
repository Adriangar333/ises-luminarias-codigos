
import React from 'react';
import { ProcessedImage } from '../types';
import { SpinnerIcon, DownloadIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ImageCardProps {
  image: ProcessedImage;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.previewUrl; // This URL points to the original blob data
    
    const extension = image.file.name.split('.').pop() || 'jpg';
    const safeCode = image.extractedCode?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'sin_codigo';
    const uniquePart = image.id.substring(0, 8);

    const finalName = (image.status !== 'success' || safeCode === 'no_encontrado' || !image.extractedCode)
      ? `no-encontrado_${uniquePart}` 
      : safeCode;

    link.download = `${finalName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatus = () => {
    switch (image.status) {
      case 'processing':
        return (
          <div className="flex items-center justify-center text-blue-400">
            <SpinnerIcon className="w-5 h-5 animate-spin mr-2" />
            <span>Procesando...</span>
          </div>
        );
      case 'success':
        const isFound = image.extractedCode && image.extractedCode.toLowerCase() !== 'no encontrado' && !image.extractedCode.toLowerCase().includes('error');
        return (
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center ${isFound ? 'text-green-400' : 'text-yellow-400'}`}>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="font-mono font-bold text-lg">{image.extractedCode}</span>
            </div>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-600 hover:bg-blue-500 text-white transition-colors duration-200"
              aria-label="Descargar imagen"
              title="Descargar imagen"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-between w-full text-red-400">
            <div className="flex items-center">
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm truncate" title={image.extractedCode || 'Error'}>{image.extractedCode || 'Error al procesar'}</span>
            </div>
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-gray-600 hover:bg-blue-500 text-white transition-colors duration-200 ml-2"
              aria-label="Descargar imagen original"
              title="Descargar imagen original"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        );
      case 'pending':
      default:
        return <div className="text-gray-400">Pendiente</div>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex flex-col">
      <div className="aspect-w-1 aspect-h-1 w-full bg-gray-900">
        <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 bg-gray-800/80 backdrop-blur-sm min-h-[76px] flex items-center justify-center">
        {renderStatus()}
      </div>
    </div>
  );
};

export default ImageCard;

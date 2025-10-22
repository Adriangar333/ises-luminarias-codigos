
import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { ProcessedImage, StoredImage, ProcessingStatus } from './types';
import { extractCodeFromImage } from './services/geminiService';
import { getAllImages, setImage, clearAllImages } from './services/db';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import { ImageIcon, SpinnerIcon, TrashIcon, PackageIcon, KeyIcon, XIcon } from './components/icons';

// Polyfill for process.env in browser environments.
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const BATCH_SIZE = 50;

const ApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localApiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Configurar Clave de API</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-400 mb-4">
          Introduce tu clave de API de Google Gemini. Se guardará en tu navegador para futuras sesiones.
        </p>
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder="Pega tu clave de API aquí"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            Guardar Clave
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Load state from IndexedDB and localStorage on initial render
  useEffect(() => {
    const loadState = async () => {
        try {
            const storedImages = await getAllImages();
            const processedImages = storedImages.map(img => ({
                ...img,
                previewUrl: URL.createObjectURL(img.file)
            }));
            setImages(processedImages);
            
            const storedApiKey = localStorage.getItem('apiKey');
            if (storedApiKey) setApiKey(storedApiKey);

        } catch (error) {
            console.error("Failed to load state from storage", error);
        }
    };
    loadState();
  }, []);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
        images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    }
  }, [images]);

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('apiKey', key);
  };

  const handleFilesSelected = useCallback(async (files: FileList) => {
    const newStoredImages: StoredImage[] = Array.from(files).map(file => ({
        id: self.crypto.randomUUID(),
        file: file,
        status: 'pending',
        extractedCode: null,
    }));

    for (const img of newStoredImages) {
        await setImage(img);
    }

    const newProcessedImages = newStoredImages.map(img => ({
        ...img,
        previewUrl: URL.createObjectURL(img.file)
    }));

    setImages(prev => [...prev, ...newProcessedImages]);
  }, []);

  const processImages = useCallback(async () => {
    const effectiveApiKey = apiKey || process.env.API_KEY || '';
    if (!effectiveApiKey) {
        setProcessingMessage("Error: Falta la clave de API. Por favor, configúrala.");
        setIsApiKeyModalOpen(true);
        return;
    }

    const allPendingImages = images.filter(img => img.status === 'pending');
    if (isProcessing || allPendingImages.length === 0) return;

    const batchToProcess = allPendingImages.slice(0, BATCH_SIZE);
    const totalInBatch = batchToProcess.length;

    setIsProcessing(true);
    setProcessingMessage(`Iniciando lote de ${totalInBatch} imágenes...`);

    const results: { id: string; status: ProcessingStatus; extractedCode: string | null }[] = [];

    for (let i = 0; i < batchToProcess.length; i++) {
        const image = batchToProcess[i];
        setProcessingMessage(`Procesando ${i + 1} de ${totalInBatch}...`);
        setImages(current => current.map(img => img.id === image.id ? { ...img, status: 'processing' } : img));
        
        try {
            const code = await extractCodeFromImage(image.file, effectiveApiKey);
            results.push({ id: image.id, status: 'success', extractedCode: code || 'No encontrado' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            results.push({ id: image.id, status: 'error', extractedCode: errorMessage });
        }
    }

    for (const result of results) {
        const imageToUpdate = images.find(img => img.id === result.id);
        if (imageToUpdate) {
            const updatedStoredImage: StoredImage = {
                ...imageToUpdate,
                status: result.status,
                extractedCode: result.extractedCode,
            };
            await setImage(updatedStoredImage);
        }
    }

    setImages(current => current.map(img => {
        const result = results.find(r => r.id === img.id);
        return result ? { ...img, status: result.status, extractedCode: result.extractedCode } : img;
    }));

    setIsProcessing(false);
    setProcessingMessage(`Lote de ${totalInBatch} imágenes completado.`);
  }, [images, isProcessing, apiKey]);

  const handleDownloadAll = async () => {
    if (isProcessing) return;
    const imagesToDownload = images.filter(img => img.status === 'success' || img.status === 'error');
    if (imagesToDownload.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("luminarias_procesadas");
    if (!folder) return;

    setProcessingMessage(`Comprimiendo ${imagesToDownload.length} imágenes...`);
    for (const image of imagesToDownload) {
        const extension = image.file.name.split('.').pop() || 'jpg';
        const safeCode = image.extractedCode?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'sin_codigo';
        const uniquePart = image.id.substring(0, 8);
        const finalName = (image.status !== 'success' || safeCode === 'no_encontrado' || !image.extractedCode) ? `no-encontrado_${uniquePart}` : safeCode;
        folder.file(`${finalName}.${extension}`, image.file);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "luminarias_procesadas.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setProcessingMessage(`Se descargaron ${imagesToDownload.length} imágenes.`);
  };

  const clearAll = async () => {
    await clearAllImages();
    setImages([]);
    setProcessingMessage('');
  };

  const pendingCount = images.filter(img => img.status === 'pending').length;
  const batchCount = Math.min(pendingCount, BATCH_SIZE);
  const processedCount = images.filter(img => img.status === 'success' || img.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} apiKey={apiKey} setApiKey={handleSetApiKey} />
      <header className="bg-gray-800/50 backdrop-blur-lg shadow-md sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold ml-3 text-gray-100">Extractor de Códigos de Luminarias</h1>
            </div>
            <button onClick={() => setIsApiKeyModalOpen(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Configurar Clave de API">
              <KeyIcon className={`h-6 w-6 ${apiKey ? 'text-green-400' : 'text-yellow-400'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {images.length === 0 ? (
          <ImageUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        ) : (
          <>
            <div className="bg-gray-800 py-4 px-4 sm:px-6 lg:px-8 shadow-inner">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex-grow">
                  {isProcessing ? (
                    <div className="flex items-center text-blue-300">
                      <SpinnerIcon className="w-5 h-5 animate-spin mr-3" />
                      <span className="font-medium">{processingMessage}</span>
                    </div>
                  ) : (
                     <p className="text-gray-300">{images.length} imágenes cargadas. {processingMessage}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={processImages}
                    disabled={isProcessing || batchCount === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Procesando...' : `Procesar Lote (${batchCount})`}
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    disabled={isProcessing || processedCount === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <PackageIcon className="w-5 h-5 mr-2" />
                    Descargar Todo ({processedCount})
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-red-700 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Limpiar Todo
                  </button>
                </div>
              </div>
            </div>
            <ImageGrid images={images} />
          </>
        )}
      </main>
      <footer className="bg-gray-900 text-center py-4 border-t border-gray-800">
        <p className="text-sm text-gray-500">Desarrollado con React y Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;

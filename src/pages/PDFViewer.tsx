import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import { useConfig } from '../contexts/ConfigContext';
import { generatePlantPDF } from '../utils/pdfGenerator';
import { AlertTriangle, Download } from 'lucide-react';

const PDFViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlantById } = usePlants();
  const { config } = useConfig();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [plantName, setPlantName] = useState<string>('');

  useEffect(() => {
    const generatePDF = async () => {
      if (id) {
        const plant = getPlantById(id);
        if (plant) {
          try {
            const pdfBlob = await generatePlantPDF(plant, config.logo);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setPlantName(plant.nomePopular);
          } catch (error) {
            console.error('Erro ao gerar PDF:', error);
          }
        }
        setLoading(false);
      }
    };

    generatePDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id, getPlantById, config.logo]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${plantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-200 max-w-lg w-full">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Planta não encontrada</h2>
          <p className="text-gray-600">O relatório que você está tentando acessar não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Relatório da Planta: {plantName}</h1>
            <button
              onClick={handleDownload}
              className="btn-primary inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Baixar PDF
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-[calc(100vh-200px)]"
          >
            <div className="p-4 text-center">
              <p>Seu navegador não suporta a visualização de PDF.</p>
              <button
                onClick={handleDownload}
                className="btn-primary inline-flex items-center mt-4"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar PDF
              </button>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
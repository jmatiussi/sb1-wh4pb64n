import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import { useConfig } from '../contexts/ConfigContext';
import { Plant } from '../types';
import { generatePlantPDF } from '../utils/pdfGenerator';
import { ArrowLeft, Edit, Trash2, File as FilePdf, AlertTriangle, Leaf, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DetalhesPlanta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlantById, deletePlant } = usePlants();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | undefined>();
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showShareLink, setShowShareLink] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      const foundPlant = getPlantById(id);
      setPlant(foundPlant);
      setLoading(false);
    }
  }, [id, getPlantById]);

  const handleDelete = () => {
    if (confirmDelete && id) {
      deletePlant(id);
      navigate('/');
    } else {
      setConfirmDelete(true);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleGeneratePDF = () => {
    if (plant) {
      const pdfBlob = generatePlantPDF(plant, config.logo);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowShareLink(true);
    }
  };

  const handleDownload = () => {
    if (pdfUrl && plant) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${plant.nomePopular.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyLink = async () => {
    if (plant) {
      try {
        const shareUrl = `${window.location.origin}/pdf/${plant.id}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado com sucesso!');
      } catch (err) {
        console.error('Erro ao copiar link:', err);
        alert('Erro ao copiar link');
      }
    }
  };

  const nextImage = () => {
    if (plant && plant.imagens.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === plant.imagens.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (plant && plant.imagens.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? plant.imagens.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  if (!plant) {
    return (
      <div className="text-center py-10 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Planta não encontrada</h2>
        <p className="text-gray-600 mb-4">A planta que você está tentando visualizar não existe ou foi removida.</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1>Detalhes da Planta</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5 h-64 md:h-auto relative">
            {plant.imagens.length > 0 ? (
              <>
                <img 
                  src={plant.imagens[currentImageIndex]} 
                  alt={plant.nomePopular}
                  className="w-full h-full object-cover"
                />
                {plant.imagens.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {plant.imagens.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-medium">
              Canteiro {plant.numeroCanteiro}
            </div>
          </div>
          
          <div className="p-6 md:w-3/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary-800">{plant.nomePopular}</h2>
                <p className="text-gray-600 italic">{plant.nomeCientifico}</p>
              </div>
              <div className="mt-2 md:mt-0 flex gap-2">
                <button 
                  onClick={handleGeneratePDF}
                  className="btn-outline py-1 flex items-center"
                >
                  <FilePdf className="h-4 w-4 mr-1" />
                  PDF
                </button>
                <button 
                  onClick={() => navigate(`/editar/${plant.id}`)}
                  className="btn-secondary py-1 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className={`py-1 flex items-center btn ${
                    confirmDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {confirmDelete ? 'Confirmar' : 'Excluir'}
                </button>
                {confirmDelete && (
                  <button 
                    onClick={cancelDelete}
                    className="py-1 flex items-center btn bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Família:</p>
                <p className="font-medium">{plant.familia}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Espécie:</p>
                <p className="font-medium">{plant.especie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Princípio Ativo:</p>
                <p className="font-medium">{plant.principioAtivo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data de Cadastro:</p>
                <p className="font-medium">{formatDate(plant.dataCadastro)}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Utilização:</p>
              <p className="bg-gray-50 p-3 rounded-md">{plant.utilizacao}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Forma de Cultivo:</p>
              <p className="bg-gray-50 p-3 rounded-md">{plant.formaCultivo}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Formas de Utilização:</p>
              <p className="bg-gray-50 p-3 rounded-md">{plant.formasUtilizacao}</p>
            </div>

            {plant.observacao && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Observações:</p>
                <p className="bg-gray-50 p-3 rounded-md">{plant.observacao}</p>
              </div>
            )}
          </div>
        </div>

        {plant.imagens.length > 1 && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Todas as Imagens</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {plant.imagens.map((imagem, index) => (
                <div 
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden ${
                    currentImageIndex === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img 
                    src={imagem} 
                    alt={`${plant.nomePopular} - Imagem ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {pdfUrl && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <Leaf className="h-5 w-5 text-green-600 mr-2 mt-1" />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-green-800 mb-2">PDF Gerado com Sucesso!</h3>
              <p className="text-gray-700 mb-3">O PDF com as informações da planta foi gerado e está pronto para download.</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleDownload}
                  className="btn-primary inline-flex items-center"
                >
                  <FilePdf className="h-4 w-4 mr-1" />
                  Baixar PDF
                </button>
                <button
                  onClick={handleCopyLink}
                  className="btn-outline inline-flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Copiar Link para Compartilhar
                </button>
              </div>
              {showShareLink && (
                <p className="mt-3 text-sm text-gray-600">
                  Link para compartilhar: {window.location.origin}/pdf/{plant.id}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesPlanta;
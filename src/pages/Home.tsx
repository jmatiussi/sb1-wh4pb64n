import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import { useClassifications } from '../contexts/ClassificationContext';
import { useConfig } from '../contexts/ConfigContext';
import PlantCard from '../components/PlantCard';
import LogoUploader from '../components/LogoUploader';
import { generateCatalog } from '../utils/catalogGenerator';
import { Plus, Leaf, Search, FileText, Settings } from 'lucide-react';
import { Plant } from '../types';

const Home: React.FC = () => {
  const { plants } = usePlants();
  const { classifications } = useClassifications();
  const { config } = useConfig();
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [generatingCatalog, setGeneratingCatalog] = useState(false);

  const filteredPlants = selectedClassification === 'all' 
    ? plants 
    : plants.filter(plant => plant.classificacao === selectedClassification);

  const handleGenerateCatalog = async () => {
    setGeneratingCatalog(true);
    try {
      const plantsToInclude = selectedClassification === 'all' 
        ? plants 
        : plants.filter(plant => plant.classificacao === selectedClassification);
      
      const pdfBlob = await generateCatalog(plantsToInclude, selectedClassification, config.logo);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalogo-plantas-${selectedClassification.toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar catálogo:', error);
      alert('Erro ao gerar catálogo. Tente novamente.');
    } finally {
      setGeneratingCatalog(false);
    }
  };

  // Combinar classificações padrão com classificações personalizadas
  const defaultClassifications = ['Medicinal', 'Tóxica', 'Aromática', 'Condimentar'];
  const customClassifications = classifications.map(c => c.nome);
  const allClassifications = [...new Set([...defaultClassifications, ...customClassifications])];

  const getClassificationDisplayName = (classification: string) => {
    if (classification === 'all') return 'Todas as Classificações';
    return `Plantas ${classification}s`;
  };

  const getCatalogButtonText = () => {
    if (selectedClassification === 'all') return 'Gerar Catálogo Completo';
    return `Gerar Catálogo de Plantas ${selectedClassification}s`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center gap-4">
          {config.logo && (
            <img 
              src={config.logo} 
              alt="Logo" 
              className="h-16 object-contain"
            />
          )}
          <div>
            <h1 className="mb-2">Horto Medicinal</h1>
            <p className="text-gray-600 max-w-2xl">
              Sistema de cadastro e consulta de plantas medicinais, facilitando a documentação e acesso a informações importantes.
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Link
            to="/cadastro"
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Nova Planta
          </Link>
          <Link
            to="/busca"
            className="btn-outline flex items-center"
          >
            <Search className="h-5 w-5 mr-1" />
            Buscar Plantas
          </Link>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center"
          >
            <Settings className="h-5 w-5 mr-1" />
            Configurações
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-8">
          <LogoUploader />
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-grow">
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">Todas as Classificações</option>
            {allClassifications.map(classification => (
              <option key={classification} value={classification}>
                Plantas {classification}s
              </option>
            ))}
          </select>
        </div>
        {filteredPlants.length > 0 && (
          <button
            onClick={handleGenerateCatalog}
            disabled={generatingCatalog}
            className="btn-secondary flex items-center disabled:opacity-50"
          >
            <FileText className="h-5 w-5 mr-1" />
            {generatingCatalog ? 'Gerando...' : getCatalogButtonText()}
          </button>
        )}
      </div>

      {filteredPlants.length > 0 ? (
        <>
          <h2 className="mb-6">
            {getClassificationDisplayName(selectedClassification)} ({filteredPlants.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <Leaf className="h-16 w-16 text-primary-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            {selectedClassification === 'all' 
              ? 'Nenhuma planta cadastrada' 
              : `Nenhuma planta ${selectedClassification.toLowerCase()} cadastrada`}
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedClassification === 'all' 
              ? 'Comece adicionando sua primeira planta ao sistema.'
              : `Adicione plantas da classificação ${selectedClassification.toLowerCase()} ao sistema.`}
          </p>
          <Link to="/cadastro" className="btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-1" />
            Cadastrar Planta
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
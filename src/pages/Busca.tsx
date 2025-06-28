import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import SearchBar from '../components/SearchBar';
import PlantCard from '../components/PlantCard';
import { Plant, SearchField } from '../types';
import { Search } from 'lucide-react';

const Busca: React.FC = () => {
  const { searchPlants } = usePlants();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<Plant[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    const field = searchParams.get('field') as SearchField;
    
    if (query && field) {
      const searchResults = searchPlants(query, field);
      setResults(searchResults);
      setSearched(true);
    } else {
      setSearched(false);
    }
  }, [searchParams, searchPlants]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">Buscar Plantas</h1>
        <p className="text-gray-600 mb-6">
          Pesquise plantas por nome popular, espécie, nome científico ou família.
        </p>

        <SearchBar 
          initialQuery={searchParams.get('q') || ''} 
          initialField={(searchParams.get('field') as SearchField) || 'nomePopular'} 
        />
      </div>

      {searched && (
        <div className="mt-10">
          <h2 className="mb-1">Resultados da Busca</h2>
          <p className="text-gray-600 mb-6">
            Encontrados {results.length} resultado(s)
          </p>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-6 flex justify-center">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Nenhuma planta encontrada</h3>
              <p className="text-gray-600">
                Tente ajustar os termos da sua busca ou use critérios diferentes.
              </p>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="mt-10 bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-xl font-semibold text-primary-800 mb-3">Dicas de Busca</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="h-5 w-5 text-primary-600 mr-2">•</span>
              <span>Use <strong>Nome Popular</strong> para buscar pelo nome comum da planta (ex: "Camomila", "Alecrim")</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 text-primary-600 mr-2">•</span>
              <span>Use <strong>Nome Científico</strong> para buscar pelo nome latino (ex: "Matricaria chamomilla")</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 text-primary-600 mr-2">•</span>
              <span>Use <strong>Família</strong> para encontrar todas as plantas de uma família botânica (ex: "Lamiaceae")</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 text-primary-600 mr-2">•</span>
              <span>Use <strong>Espécie</strong> para buscar por espécie específica (ex: "officinalis")</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Busca;
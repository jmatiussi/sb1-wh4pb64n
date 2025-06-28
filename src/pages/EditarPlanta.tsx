import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import PlantForm from '../components/PlantForm';
import { Plant } from '../types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const EditarPlanta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlantById, updatePlant } = usePlants();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundPlant = getPlantById(id);
      setPlant(foundPlant);
      setLoading(false);
    }
  }, [id, getPlantById]);

  const handleSubmit = (plantData: Omit<Plant, 'id' | 'dataCadastro'>) => {
    if (plant) {
      const updatedPlant: Plant = {
        ...plantData,
        id: plant.id,
        dataCadastro: plant.dataCadastro
      };
      updatePlant(updatedPlant);
      navigate(`/planta/${plant.id}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  if (!plant) {
    return (
      <div className="text-center py-10 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Planta não encontrada</h2>
        <p className="text-gray-600 mb-4">A planta que você está tentando editar não existe ou foi removida.</p>
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
        <h1>Editar Planta</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Atualize as informações da planta medicinal nos campos abaixo. Campos marcados com * são obrigatórios.
        </p>
      </div>

      <PlantForm 
        initialData={plant}
        onSubmit={handleSubmit}
        buttonText="Salvar Alterações"
      />
    </div>
  );
};

export default EditarPlanta;
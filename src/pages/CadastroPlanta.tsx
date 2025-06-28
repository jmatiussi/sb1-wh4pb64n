import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import PlantForm from '../components/PlantForm';
import { Plant } from '../types';
import { ArrowLeft } from 'lucide-react';

const CadastroPlanta: React.FC = () => {
  const { addPlant } = usePlants();
  const navigate = useNavigate();

  const handleSubmit = async (plantData: Omit<Plant, 'id' | 'dataCadastro'>) => {
    try {
      await addPlant(plantData);
      alert('Planta cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar planta:', error);
      alert('Erro ao cadastrar planta. Tente novamente.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1>Cadastro de Nova Planta</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Preencha os campos abaixo com as informações da planta medicinal. Campos marcados com * são obrigatórios.
        </p>
      </div>

      <PlantForm 
        onSubmit={handleSubmit}
        buttonText="Cadastrar Planta"
      />
    </div>
  );
};

export default CadastroPlanta;
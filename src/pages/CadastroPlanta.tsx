import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../contexts/PlantContext';
import PlantForm from '../components/PlantForm';
import { Plant } from '../types';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';

const CadastroPlanta: React.FC = () => {
  const { addPlant } = usePlants();
  const navigate = useNavigate();
  const [resetForm, setResetForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPlantName, setLastPlantName] = useState('');

  const handleSubmit = async (plantData: Omit<Plant, 'id' | 'dataCadastro'>) => {
    try {
      await addPlant(plantData);
      setLastPlantName(plantData.nomePopular);
      setShowSuccess(true);
      
      // Resetar o formulário
      setResetForm(true);
      
      // Ocultar mensagem de sucesso após 8 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
    } catch (error) {
      console.error('Erro ao cadastrar planta:', error);
      alert('Erro ao cadastrar planta. Tente novamente.');
    }
  };

  const handleResetComplete = () => {
    setResetForm(false);
  };

  const closeSuccessMessage = () => {
    setShowSuccess(false);
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

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in relative">
          <button
            onClick={closeSuccessMessage}
            className="absolute top-2 right-2 text-green-600 hover:text-green-800 transition-colors"
            title="Fechar mensagem"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start pr-8">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Planta cadastrada com sucesso!</h3>
              <p className="text-green-700 mb-2">
                A planta <strong>"{lastPlantName}"</strong> foi adicionada ao sistema com sucesso.
              </p>
              <p className="text-green-600 text-sm">
                O formulário foi automaticamente limpo para você cadastrar uma nova planta. 
                Continue preenchendo os campos abaixo para adicionar mais plantas ao sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      <PlantForm 
        onSubmit={handleSubmit}
        buttonText="Cadastrar Planta"
        resetForm={resetForm}
        onResetComplete={handleResetComplete}
      />
    </div>
  );
};

export default CadastroPlanta;
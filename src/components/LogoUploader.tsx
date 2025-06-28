import React, { ChangeEvent } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Upload, Image as ImageIcon, Save } from 'lucide-react';

const LogoUploader: React.FC = () => {
  const { config, updateLogo, saveConfig, loading } = useConfig();

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        updateLogo(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Logo do Sistema</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo Atual
        </label>
        {config.logo ? (
          <div className="relative w-48 h-24 border rounded-lg overflow-hidden">
            <img 
              src={config.logo} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-48 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alterar Logo
        </label>
        <input
          type="file"
          onChange={handleLogoChange}
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="mt-2 text-sm text-gray-500">
          Recomendado: imagem PNG ou SVG com fundo transparente
        </p>
      </div>

      <button
        onClick={saveConfig}
        disabled={loading}
        className="btn-primary flex items-center"
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Salvando...' : 'Salvar Configurações'}
      </button>
    </div>
  );
};

export default LogoUploader;
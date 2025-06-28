import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppConfig } from '../types';

interface ConfigContextData {
  config: AppConfig;
  updateLogo: (logo: string) => void;
  saveConfig: () => void;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextData>({} as ConfigContextData);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>({});
  const [loading, setLoading] = useState(false);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedConfig = localStorage.getItem('horto-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const updateLogo = (logo: string) => {
    setConfig(prev => ({ ...prev, logo }));
  };

  const saveConfig = () => {
    setLoading(true);
    try {
      localStorage.setItem('horto-config', JSON.stringify(config));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateLogo, saveConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
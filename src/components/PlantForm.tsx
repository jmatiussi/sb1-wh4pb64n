import React, { useState, ChangeEvent, useEffect } from 'react';
import { Plant } from '../types';
import { useClassifications } from '../contexts/ClassificationContext';
import { X, Save, Upload } from 'lucide-react';

interface PlantFormProps {
  initialData?: Partial<Plant>;
  onSubmit: (data: Omit<Plant, 'id' | 'dataCadastro'>) => void;
  buttonText: string;
  resetForm?: boolean;
  onResetComplete?: () => void;
}

const PlantForm: React.FC<PlantFormProps> = ({ 
  initialData = {}, 
  onSubmit, 
  buttonText, 
  resetForm = false,
  onResetComplete 
}) => {
  const { classifications } = useClassifications();
  
  // Estado inicial do formulário
  const getInitialFormData = () => ({
    nomePopular: initialData.nomePopular || '',
    familia: initialData.familia || '',
    especie: initialData.especie || '',
    nomeCientifico: initialData.nomeCientifico || '',
    numeroCanteiro: initialData.numeroCanteiro || '',
    utilizacao: initialData.utilizacao || '',
    principioAtivo: initialData.principioAtivo || '',
    observacao: initialData.observacao || '',
    formaCultivo: initialData.formaCultivo || '',
    formasUtilizacao: initialData.formasUtilizacao || '',
    imagens: initialData.imagens || [],
    classificacao: initialData.classificacao || 'Medicinal'
  });

  const getEmptyFormData = () => ({
    nomePopular: '',
    familia: '',
    especie: '',
    nomeCientifico: '',
    numeroCanteiro: '',
    utilizacao: '',
    principioAtivo: '',
    observacao: '',
    formaCultivo: '',
    formasUtilizacao: '',
    imagens: [],
    classificacao: 'Medicinal'
  });

  const [formData, setFormData] = useState<Omit<Plant, 'id' | 'dataCadastro'>>(getInitialFormData());

  // Efeito para resetar o formulário quando solicitado
  useEffect(() => {
    if (resetForm) {
      const emptyFormData = getEmptyFormData();
      setFormData(emptyFormData);
      
      // Limpar também os campos de arquivo
      setTimeout(() => {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input: any) => {
          input.value = '';
        });
      }, 100);
      
      if (onResetComplete) {
        onResetComplete();
      }
    }
  }, [resetForm, onResetComplete]);

  // Efeito para atualizar o formulário quando initialData mudar (para edição)
  useEffect(() => {
    if (!resetForm && Object.keys(initialData).length > 0) {
      setFormData(getInitialFormData());
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            imagens: [...prev.imagens, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });

      // Limpar o input após processar os arquivos
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Combinar classificações padrão com classificações personalizadas
  const defaultClassifications = ['Medicinal', 'Tóxica', 'Aromática', 'Condimentar'];
  const customClassifications = classifications.map(c => c.nome);
  const allClassifications = [...new Set([...defaultClassifications, ...customClassifications])];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="nomePopular" className="input-label">Nome Popular*</label>
          <input
            type="text"
            id="nomePopular"
            name="nomePopular"
            value={formData.nomePopular}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: Camomila, Alecrim, Boldo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="classificacao" className="input-label">Classificação*</label>
          <select
            id="classificacao"
            name="classificacao"
            value={formData.classificacao}
            onChange={handleChange}
            required
            className="input-field"
          >
            {allClassifications.map(classification => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="familia" className="input-label">Família*</label>
          <input
            type="text"
            id="familia"
            name="familia"
            value={formData.familia}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: Asteraceae, Lamiaceae"
          />
        </div>

        <div className="form-group">
          <label htmlFor="especie" className="input-label">Espécie*</label>
          <input
            type="text"
            id="especie"
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: officinalis, vulgaris"
          />
        </div>

        <div className="form-group">
          <label htmlFor="nomeCientifico" className="input-label">Nome Científico*</label>
          <input
            type="text"
            id="nomeCientifico"
            name="nomeCientifico"
            value={formData.nomeCientifico}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: Matricaria chamomilla"
          />
        </div>

        <div className="form-group">
          <label htmlFor="numeroCanteiro" className="input-label">Número do Canteiro*</label>
          <input
            type="text"
            id="numeroCanteiro"
            name="numeroCanteiro"
            value={formData.numeroCanteiro}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: 01, A1, Setor-B"
          />
        </div>

        <div className="form-group">
          <label htmlFor="principioAtivo" className="input-label">Princípio Ativo*</label>
          <input
            type="text"
            id="principioAtivo"
            name="principioAtivo"
            value={formData.principioAtivo}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: Flavonoides, Óleos essenciais"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="utilizacao" className="input-label">Utilização*</label>
        <textarea
          id="utilizacao"
          name="utilizacao"
          value={formData.utilizacao}
          onChange={handleChange}
          required
          rows={3}
          className="input-field"
          placeholder="Descreva para que a planta é utilizada medicinalmente..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="formaCultivo" className="input-label">Forma de Cultivo*</label>
        <textarea
          id="formaCultivo"
          name="formaCultivo"
          value={formData.formaCultivo}
          onChange={handleChange}
          required
          rows={3}
          className="input-field"
          placeholder="Descreva como cultivar a planta (solo, clima, irrigação, etc.)..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="formasUtilizacao" className="input-label">Formas de Utilização*</label>
        <textarea
          id="formasUtilizacao"
          name="formasUtilizacao"
          value={formData.formasUtilizacao}
          onChange={handleChange}
          required
          rows={3}
          className="input-field"
          placeholder="Descreva como a planta pode ser utilizada (chá, tintura, cataplasma, etc.)..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="observacao" className="input-label">Observação</label>
        <textarea
          id="observacao"
          name="observacao"
          value={formData.observacao}
          onChange={handleChange}
          rows={3}
          className="input-field"
          placeholder="Informações adicionais, contraindicações, cuidados especiais..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="imagens" className="input-label flex items-center gap-2">
          Imagens da Planta
          <Upload className="h-4 w-4 text-gray-500" />
        </label>
        <input
          type="file"
          id="imagens"
          name="imagens"
          onChange={handleImageChange}
          accept="image/*"
          multiple
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          Selecione uma ou mais imagens da planta (formatos: JPG, PNG, GIF)
        </p>
      </div>

      {formData.imagens.length > 0 && (
        <div className="mt-4 mb-6">
          <p className="input-label mb-2">Imagens selecionadas ({formData.imagens.length}):</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.imagens.map((imagem, index) => (
              <div key={index} className="relative group">
                <img 
                  src={imagem} 
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remover imagem"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button 
          type="submit" 
          className="btn-primary flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default PlantForm;
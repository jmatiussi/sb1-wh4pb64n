import React, { useState } from 'react';
import { useClassifications } from '../contexts/ClassificationContext';
import { Classification } from '../types';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

const Classificacoes: React.FC = () => {
  const { classifications, addClassification, updateClassification, deleteClassification } = useClassifications();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#4CAF50'
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClassification({
          id: editingId,
          ...formData,
          dataCriacao: classifications.find(c => c.id === editingId)?.dataCriacao || new Date().toISOString()
        });
      } else {
        await addClassification(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar classificação:', error);
      alert('Erro ao salvar classificação. Tente novamente.');
    }
  };

  const handleEdit = (classification: Classification) => {
    setFormData({
      nome: classification.nome,
      descricao: classification.descricao,
      cor: classification.cor
    });
    setEditingId(classification.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteClassification(id);
        setConfirmDelete(null);
      } catch (error) {
        console.error('Erro ao excluir classificação:', error);
        alert('Erro ao excluir classificação. Tente novamente.');
      }
    } else {
      setConfirmDelete(id);
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '', cor: '#4CAF50' });
    setEditingId(null);
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6">Gerenciar Classificações</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Classificações Cadastradas</h2>
              {classifications.length > 0 ? (
                <div className="space-y-4">
                  {classifications.map(classification => (
                    <div 
                      key={classification.id}
                      className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: classification.cor }}
                          />
                          <h3 className="font-semibold">{classification.nome}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(classification)}
                            className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(classification.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{classification.descricao}</p>
                      {confirmDelete === classification.id && (
                        <div className="mt-3 flex items-center space-x-2 text-sm">
                          <span className="text-red-600">Confirmar exclusão?</span>
                          <button
                            onClick={() => handleDelete(classification.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Não
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma classificação cadastrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Classificação' : 'Nova Classificação'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="mt-1 input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="mt-1 input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label htmlFor="cor" className="block text-sm font-medium text-gray-700">
                  Cor
                </label>
                <input
                  type="color"
                  id="cor"
                  value={formData.cor}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-gray-300 cursor-pointer"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isEditing ? (
                    <>
                      <Edit className="h-5 w-5 mr-1" />
                      Atualizar
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-1" />
                      Adicionar
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Classificacoes;
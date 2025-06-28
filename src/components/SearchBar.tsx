import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchField } from '../types';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  initialField?: SearchField;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialQuery = '', 
  initialField = 'nomePopular' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [field, setField] = useState<SearchField>(initialField);
  const navigate = useNavigate();

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFieldChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setField(e.target.value as SearchField);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query)}&field=${field}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Digite sua busca..."
            value={query}
            onChange={handleQueryChange}
            className="input-field"
          />
        </div>
        <div className="md:w-1/4">
          <select
            value={field}
            onChange={handleFieldChange}
            className="input-field"
          >
            <option value="nomePopular">Nome Popular</option>
            <option value="especie">Espécie</option>
            <option value="nomeCientifico">Nome Científico</option>
            <option value="familia">Família</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="btn-primary flex items-center justify-center"
        >
          <Search className="h-5 w-5 mr-1" />
          Buscar
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
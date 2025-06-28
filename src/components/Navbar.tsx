import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Search, Tag } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}&field=nomePopular`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8" />
              <span className="text-xl font-bold">Horto Medicinal</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors">
              Início
            </Link>
            <Link to="/cadastro" className="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors">
              Cadastrar Planta
            </Link>
            <Link to="/busca" className="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors">
              Buscar
            </Link>
            <Link to="/classificacoes" className="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              Classificações
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Buscar planta..."
                className="px-3 py-1 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-primary-600 px-3 py-1 rounded-r-md hover:bg-primary-500 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-800 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link 
              to="/cadastro" 
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Cadastrar Planta
            </Link>
            <Link 
              to="/busca" 
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Buscar
            </Link>
            <Link 
              to="/classificacoes" 
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Tag className="h-4 w-4 mr-1" />
              Classificações
            </Link>
          </div>
          <div className="px-2 pb-3">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Buscar planta..."
                className="flex-1 px-3 py-2 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-primary-600 px-3 py-2 rounded-r-md hover:bg-primary-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plant } from '../types';
import { FileText, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const defaultImage = 'https://images.pexels.com/photos/3094208/pexels-photo-3094208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === plant.imagens.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? plant.imagens.length - 1 : prev - 1
    );
  };

  const getClassificationColor = (classificacao: string) => {
    switch (classificacao) {
      case 'Medicinal':
        return 'bg-green-600';
      case 'Tóxica':
        return 'bg-red-600';
      case 'Aromática':
        return 'bg-purple-600';
      case 'Condimentar':
        return 'bg-orange-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <div className="card group hover:scale-[1.02] transition-all duration-200 animate-slide-up">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={plant.imagens[currentImageIndex] || defaultImage} 
          alt={plant.nomePopular} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {plant.imagens.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); previousImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {plant.imagens.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold text-shadow-lg">{plant.nomePopular}</h3>
          <p className="text-sm italic font-light text-shadow-lg">{plant.nomeCientifico}</p>
        </div>
        <div className={`absolute top-0 right-0 ${getClassificationColor(plant.classificacao)} text-white px-3 py-1 text-sm font-medium`}>
          {plant.classificacao}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-600">Família: <span className="text-gray-800 font-medium">{plant.familia}</span></p>
          <p className="text-sm text-gray-600">Canteiro: <span className="text-gray-800 font-medium">{plant.numeroCanteiro}</span></p>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {plant.utilizacao}
        </p>
        <div className="flex justify-between items-center">
          <Link 
            to={`/planta/${plant.id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium text-sm"
          >
            <FileText className="mr-1 h-4 w-4" />
            Detalhes
          </Link>
          <Link 
            to={`/editar/${plant.id}`}
            className="inline-flex items-center text-secondary-600 hover:text-secondary-800 font-medium text-sm"
          >
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
import React from 'react';
import { Heart, Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Leaf className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Horto Medicinal</span>
          </div>
          <div className="text-center md:text-right">
            <p className="flex items-center justify-center md:justify-end">
              Desenvolvido com <Heart className="h-4 w-4 mx-1 text-red-400" /> para amantes de plantas medicinais
            </p>
            <p className="text-sm mt-1">&copy; {new Date().getFullYear()} Horto Medicinal. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
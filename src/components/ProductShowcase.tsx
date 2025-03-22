import { useNavigate } from 'react-router-dom';
import { CarModel } from '../types';
import { getCarIcon } from './utils';

interface ProductShowcaseProps {
  title: string;
  models: CarModel[];
}

export default function ProductShowcase({ title, models }: ProductShowcaseProps) {
  const navigate = useNavigate();
  
  const handleModelClick = (model: CarModel) => {
    // Navigate to products page with model filtering instead of shops
    navigate(`/products?make=${encodeURIComponent(model.make)}&model=${encodeURIComponent(model.model)}`);
  };
  
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5 lg:gap-x-8">
          {models.map((model) => (
            <div 
              key={model.id} 
              className="group relative cursor-pointer"
              onClick={() => handleModelClick(model)}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative block overflow-hidden rounded-lg group">
                  <div className="w-full h-0 pb-[100%] bg-gray-200 relative overflow-hidden group-hover:shadow-md transition-shadow duration-300">
                    {/* Car illustration */}
                    <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-400">
                      {getCarIcon(model.make)}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <h3 className="text-sm font-medium text-gray-900">{model.make} {model.model}</h3>
                    <p className="text-xs text-gray-500">{model.yearStart}{model.yearEnd ? `-${model.yearEnd}` : '+'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
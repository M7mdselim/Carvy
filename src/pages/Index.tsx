
import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import { observeElements } from '@/utils/animations';
import { CarModel } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const Index = () => {
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = observeElements();
    fetchFeaturedModels();
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const fetchFeaturedModels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('car_models')
        .select('*')
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedModels: CarModel[] = data.map(model => ({
          id: model.id,
          make: model.make,
          model: model.model,
          yearStart: model.year_start,
          yearEnd: model.year_end || undefined
        }));
        setModels(formattedModels);
      }
    } catch (error) {
      console.error('Error fetching car models:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main>
        <Hero />
        <Features />
        {!loading && <ProductShowcase title={t('popularCarModels')} models={models} />}
      </main>
    </div>
  );
};

export default Index;

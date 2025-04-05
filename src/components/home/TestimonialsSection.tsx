
import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Star } from 'lucide-react'

const TestimonialsSection = () => {
  const { t } = useLanguage()

  // Sample testimonials - in a real app, these would come from an API
  const testimonials = [
    {
      id: 1,
      name: 'Ahmed Mohamed',
      role: 'BMW Owner',
      content: 'testimonial1',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    },
    {
      id: 2,
      name: 'Sara Ahmed',
      role: 'Toyota Owner',
      content: 'testimonial2',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    },
    {
      id: 3,
      name: 'Mohamed Ali',
      role: 'Mercedes Owner',
      content: 'testimonial3',
      rating: 4,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('customerFeedback')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('customerFeedbackDescription')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote>
                <p className="text-gray-700 italic">"{t(testimonial.content)}"</p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection

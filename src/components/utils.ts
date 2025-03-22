
import React from 'react';
import { Car, Bus, Truck } from 'lucide-react';

export function getCarIcon(make: string): JSX.Element {
  const makeNormalized = make.toLowerCase();
  
  if (makeNormalized.includes('truck') || makeNormalized.includes('lorry')) {
    return React.createElement(Truck);
  } else if (makeNormalized.includes('bus') || makeNormalized.includes('van')) {
    return React.createElement(Bus);
  } else {
    return React.createElement(Car);
  }
}

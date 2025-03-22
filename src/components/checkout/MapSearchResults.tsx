
import React from 'react';

interface SearchResultsProps {
  results: any[];
  onSelect: (result: any) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md max-h-48 overflow-y-auto">
      {results.map((result, i) => (
        <div
          key={i}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelect(result)}
        >
          <div className="font-medium">{result.name}</div>
          <div className="text-sm text-gray-600">{result.formatted_address}</div>
        </div>
      ))}
    </div>
  );
}

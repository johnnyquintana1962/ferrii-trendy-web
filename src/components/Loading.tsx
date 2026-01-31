import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-brand-cream/20">
            <Loader2 className="w-12 h-12 text-brand-brown animate-spin mb-4" />
            <p className="text-brand-brown/70 font-medium animate-pulse">Cargando catálogo...</p>
        </div>
    );
};

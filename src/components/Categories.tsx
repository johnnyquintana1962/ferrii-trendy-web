import React from 'react';
import { Media } from './Media';
import { Category } from '../types';

interface CategoriesProps {
    categories: Category[];
}

export const Categories: React.FC<CategoriesProps> = ({ categories }) => {
    // Sort by order
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-brand-brown font-serif text-center mb-12">
                    Categorías
                </h2>

                {/* CATEGORÍAS DINÁMICAS DESDE FIREBASE - MOBILE OPTIMIZED */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {sortedCategories.map(cat => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            className="group relative aspect-square overflow-hidden rounded-xl md:rounded-2xl cursor-pointer touch-manipulation"
                        >
                            <div className="absolute inset-0">
                                <Media
                                    src={cat.imageUrl}
                                    alt={cat.name}
                                    className="group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-wider uppercase border-2 border-white/80 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm text-center">
                                    {cat.name}
                                </h3>
                            </div>
                        </a>
                    ))}
                </div>

                {/* SOLO DOS BOTONES: OFERTAS Y NOVEDADES - MOBILE OPTIMIZED */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 md:mt-12 px-4">
                    <a
                        href="#catalogo?filtro=oferta"
                        className="bg-brand-brown text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl text-center text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                        🔥 Ofertas
                    </a>
                    <a
                        href="#catalogo?filtro=nueva"
                        className="bg-brand-brown text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl text-center text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                        ✨ Novedades
                    </a>
                </div>
            </div>
        </section>
    );
};

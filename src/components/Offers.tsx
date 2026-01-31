import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface OffersProps {
    products: Product[];
    onAddToCart: (product: Product, talle?: string) => void;
    onViewDetails: (product: Product) => void;
}

export const Offers: React.FC<OffersProps> = ({ products, onAddToCart, onViewDetails }) => {
    const offers = products.filter(p => p.oferta && p.stock_inmediato);

    if (offers.length === 0) return null;

    return (
        <section id="ofertas" className="py-16 bg-brand-cream/30">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-serif font-black text-brand-brown uppercase tracking-tighter mb-2 italic">Liquidación Flash</h2>
                        <p className="text-brand-brown/50 font-bold uppercase tracking-widest text-xs">Aprovechá el stock inmediato</p>
                    </div>
                    <a href="#catalogo" className="bg-brand-brown/5 text-brand-brown px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-brown hover:text-white transition-all">Ver todo el catálogo</a>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory pt-4 px-4 -mx-4 scrollbar-hide">
                    {offers.map((product, index) => (
                        <div key={product.id} className="min-w-[300px] w-[300px] md:min-w-[340px] md:w-[340px] snap-start">
                            <ProductCard
                                product={product}
                                index={index}
                                onAddToCart={onAddToCart}
                                onViewDetails={onViewDetails}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

import React, { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Media, isMediaVideo } from './Media';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    index: number;
    onAddToCart: (product: Product, talle?: string) => void;
    onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onAddToCart, onViewDetails }) => {
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [showSizeError, setShowSizeError] = useState(false);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);

    // Standardization: always use 'imagenes' and PRIORITIZE videos
    const images = React.useMemo(() => {
        const raw = Array.isArray(product.imagenes) && product.imagenes.length > 0
            ? product.imagenes
            : ['https://placehold.co/400x400?text=No+Image'];

        // Sort: Videos first, then everything else
        return [...raw].sort((a, b) => {
            const isVidA = isMediaVideo(a);
            const isVidB = isMediaVideo(b);
            if (isVidA && !isVidB) return -1;
            if (!isVidA && isVidB) return 1;
            return 0;
        });
    }, [product.imagenes]);

    const nextImg = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (images.length <= 1) return; // Guard for single image
        setCurrentImgIdx(prev => (prev + 1) % images.length);
    };

    const prevImg = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (images.length <= 1) return; // Guard for single image
        setCurrentImgIdx(prev => (prev - 1 + images.length) % images.length);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.talles && product.talles.length > 0 && !selectedSize) {
            setShowSizeError(true);
            return;
        }
        onAddToCart(product, selectedSize);
        setShowSizeError(false);
    };

    const whatsappText = `¡Hola! 👋 Quisiera consultar sobre: *${product.nombre}* - ${product.descripcion?.split('\n')[0].substring(0, 100) || 'Sin descripción'}`;
    const whatsappLink = `https://wa.me/595981630337?text=${encodeURIComponent(whatsappText)}`;

    return (
        <div
            className="bg-white group rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-brown/5 flex flex-col h-full relative"
        >
            {/* Image Section - Forced Square for grid consistency */}
            <div className="relative aspect-square overflow-hidden bg-brand-cream/10 cursor-pointer" onClick={() => onViewDetails(product)}>
                <Media
                    src={images[currentImgIdx]}
                    alt={`${product.nombre} - Ferrii Trendy (Ferri Trendy) - ${currentImgIdx + 1}`}
                    priority={index < 4}
                    size="thumbnail"
                    className="group-hover:scale-110 transition-transform duration-1000 h-full w-full object-cover"
                />

                {/* Carousel Arrows - FIXED: Always visible on mobile, hover on desktop */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-3 z-40">
                        <button
                            onClick={prevImg}
                            className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl text-brand-brown opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-white active:scale-90 shadow-xl pointer-events-auto"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextImg}
                            className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl text-brand-brown opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-white active:scale-90 shadow-xl pointer-events-auto"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 pointer-events-none">
                    <span className={`text-[9px] font-black px-4 py-2 uppercase tracking-widest rounded-full shadow-xl backdrop-blur-md ${product.stock_inmediato ? 'bg-green-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                        {product.stock_inmediato ? 'Stock Ya' : 'Bajo Pedido'}
                    </span>
                </div>
            </div>

            {/* Info Section - Compact on mobile */}
            <div className="p-4 md:p-8 flex flex-col flex-1">
                <div className="flex-1 cursor-pointer" onClick={() => onViewDetails(product)}>
                    <h3 className="font-black text-lg md:text-2xl text-brand-brown leading-tight tracking-tighter mb-1">{product.nombre}</h3>
                    <p className="text-[8px] md:text-[10px] text-brand-brown/40 uppercase font-black tracking-[0.2em] mb-3">{product.categoria}</p>
                </div>

                <div className="pt-4 md:pt-6 border-t border-brand-brown/5 space-y-4 md:space-y-6">
                    <div>
                        {product.precio ? (
                            <span className="text-xl md:text-3xl font-black text-brand-brown tracking-tighter">
                                Gs. {product.precio.toLocaleString('es-PY')}
                            </span>
                        ) : (
                            <p className="text-green-700 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> Consultar Precio
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {product.talles && product.talles.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {product.talles.slice(0, 4).map(talle => (
                                    <button
                                        key={talle}
                                        onClick={(e) => { e.stopPropagation(); setSelectedSize(talle); setShowSizeError(false); }}
                                        className={`min-w-[40px] h-10 rounded-xl text-[10px] font-black border-2 transition-all ${selectedSize === talle ? 'bg-brand-brown text-white border-brand-brown' : 'border-brand-brown/5 text-brand-brown/30 hover:border-brand-brown/20'}`}
                                    >
                                        {talle}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showSizeError && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center">⚠️ Elige talle</p>}

                        {/* ALWAYS VISIBLE ADD TO CART BUTTON AS REQUESTED */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-brand-brown text-white py-3 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 group text-xs md:text-base"
                        >
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-120 transition-transform" />
                            Añadir
                        </button>

                        {/* If no price, show WhatsApp button as well or just a note */}
                        {!product.precio && (
                            <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full border-2 border-green-500 text-green-700 py-3 rounded-[1.5rem] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-green-50 transition-all text-[10px]">
                                <MessageCircle className="w-4 h-4" /> Consultar detalles
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Media, isMediaVideo } from './Media';
import { Product } from '../types';

interface ProductModalProps {
    product: Product | null;
    allProducts: Product[];
    onClose: () => void;
    onAddToCart: (product: Product, talle?: string) => void;
    onViewProduct?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, allProducts = [], onClose, onAddToCart, onViewProduct }) => {
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [showSizeError, setShowSizeError] = useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Reset state when product changes
    useEffect(() => {
        setCurrentImgIdx(0);
        setSelectedSize("");
        setShowSizeError(false);
        // Scroll content to top
        if (contentRef.current) {
            contentRef.current.scrollTo(0, 0);
        }
    }, [product?.id]);

    // Derived values with robust guards
    const images = useMemo(() => {
        const raw = (product?.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0)
            ? product.imagenes
            : ['https://placehold.co/400x400?text=No+Image'];

        return [...raw].sort((a, b) => {
            const isVidA = isMediaVideo(a);
            const isVidB = isMediaVideo(b);
            if (isVidA && !isVidB) return -1;
            if (!isVidA && isVidB) return 1;
            return 0;
        });
    }, [product?.imagenes]);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return (allProducts || [])
            .filter(p => p?.categoria === product?.categoria && p?.id !== product?.id)
            .slice(0, 3);
    }, [allProducts, product]);

    if (!product) return null;

    const handleAddToCart = () => {
        if (product?.talles && product.talles.length > 0 && !selectedSize) {
            setShowSizeError(true);
            return;
        }
        onAddToCart(product, selectedSize);
        onClose();
    };

    const nextImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (images.length <= 1) return;
        setCurrentImgIdx(prev => (prev + 1) % images.length);
    };

    const prevImg = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (images.length <= 1) return;
        setCurrentImgIdx(prev => (prev - 1 + images.length) % images.length);
    };

    const whatsappText = `¡Hola! 👋 Quisiera consultar sobre este producto: *${product.nombre}*\n\nDetalles:\n${product.descripcion || 'Sin descripción'}`;
    const whatsappLink = `https://wa.me/595981630337?text=${encodeURIComponent(whatsappText)}`;

    // Simple Next Image Preload logic
    const nextIdx = (currentImgIdx + 1) % images.length;
    const nextSrc = images[nextIdx];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative bg-white w-full max-w-7xl max-h-[92vh] rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-brand-brown/10">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-[110] p-4 bg-black/10 backdrop-blur-3xl rounded-full text-brand-brown hover:bg-brand-brown hover:text-white transition-all active:scale-95 shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative w-full md:w-[55%] bg-[#FDFCFB] flex items-center justify-center overflow-hidden h-[40vh] md:h-auto min-h-[40vh] md:min-h-0 border-r border-brand-brown/5 flex-none">
                    <div className="w-full h-full" style={{ transition: 'opacity 0.15s ease-in-out' }}>
                        <Media
                            src={images[currentImgIdx] || 'https://placehold.co/400x400?text=No+Image'}
                            alt={product?.nombre || "Producto"}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 flex gap-2 z-50">
                            {images.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentImgIdx ? 'w-8 bg-brand-brown' : 'w-2 bg-brand-brown/20'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* LAYER 2: Navigation Arrows (Larger hit area for mobile) */}
                {images.length > 1 && (
                    <>
                        {/* NEXT IMAGE HIDDEN DIV FOR CACHING */}
                        {!isMediaVideo(nextSrc) && (
                            <div className="hidden">
                                <img src={nextSrc} alt="preload-next" />
                            </div>
                        )}

                        <button
                            onClick={prevImg}
                            style={{
                                position: 'absolute',
                                top: '20vh',
                                left: '0.5rem',
                                transform: 'translateY(-50%)',
                                zIndex: 999,
                                pointerEvents: 'auto',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                            className="p-3 md:p-4 bg-white/90 backdrop-blur-sm rounded-full text-brand-brown hover:bg-brand-brown hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button
                            onClick={nextImg}
                            style={{
                                position: 'absolute',
                                top: '20vh',
                                transform: 'translateY(-50%)',
                                zIndex: 999,
                                pointerEvents: 'auto',
                                minWidth: '44px',
                                minHeight: '44px'
                            }}
                            className="p-3 md:p-4 bg-white/90 backdrop-blur-sm rounded-full text-brand-brown hover:bg-brand-brown hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center md:right-[calc(45%+1rem)] right-[0.5rem]"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </>
                )}

                {/* LAYER 3: Content Right */}
                <div ref={contentRef} className="w-full md:w-[45%] p-4 md:p-20 flex flex-col overflow-y-auto custom-scrollbar bg-white flex-1">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 md:mb-8">
                            <span className="text-[8px] md:text-[10px] font-black bg-brand-brown text-white px-3 md:px-5 py-1.5 md:py-2 rounded-full uppercase tracking-widest leading-none">
                                {product?.categoria || "General"}
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-7xl font-black text-brand-brown font-serif mb-2 md:mb-6 leading-tight md:leading-none tracking-tighter">
                            {product?.nombre || "Producto sin nombre"}
                        </h2>

                        <div className="mb-4 md:mb-12">
                            <span className="text-[9px] md:text-[11px] font-black text-brand-brown/30 uppercase tracking-[0.2em] md:tracking-[0.3em] block mb-1">Precio</span>
                            <p className="text-3xl md:text-5xl font-black text-brand-brown tracking-tighter">
                                Gs. {product?.precio?.toLocaleString('es-PY') || 'Consultar'}
                            </p>
                        </div>

                        <p className="text-brand-brown/60 text-base md:text-xl leading-relaxed mb-6 md:mb-12 font-medium">
                            {product?.descripcion || "Sin descripción disponible."}
                        </p>

                        {product?.talles && product.talles.length > 0 && (
                            <div className="mb-8">
                                <span className="text-[9px] md:text-[11px] font-black text-brand-brown/30 uppercase tracking-[0.2em] md:tracking-[0.3em] block mb-4">Talle</span>
                                <div className="flex gap-2 md:gap-4 flex-wrap">
                                    {product.talles.map(talle => (
                                        <button
                                            key={talle}
                                            onClick={() => { setSelectedSize(talle); setShowSizeError(false); }}
                                            className={`min-w-[48px] md:min-w-[64px] h-12 md:h-16 rounded-xl md:rounded-2xl text-xs md:text-sm font-black border-2 transition-all ${selectedSize === talle ? 'bg-brand-brown text-white border-brand-brown shadow-xl' : 'bg-[#FDFCFB] border-brand-brown/5 text-brand-brown/30'}`}
                                        >
                                            {talle}
                                        </button>
                                    ))}
                                </div>
                                {showSizeError && <p className="text-[10px] text-red-500 mt-2 font-black uppercase">Elige un talle</p>}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-brand-brown/5 flex flex-col gap-3">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-brand-brown text-white h-[60px] md:py-8 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-black transition-all shadow-xl text-base md:text-xl"
                        >
                            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                            Añadir al Carrito
                        </button>

                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-[#D4AF37] text-white h-[56px] md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#C4A137] transition-all text-sm md:text-xs"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Consultar WhatsApp
                        </a>

                        <button
                            onClick={onClose}
                            className="w-full text-brand-brown font-black uppercase tracking-widest h-[48px] flex items-center justify-center border-2 border-brand-brown/10 rounded-xl mt-4 hover:bg-brand-brown/5 transition-all text-sm"
                        >
                            ← Volver al Catálogo
                        </button>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-brand-brown/5">
                            <h3 className="text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-10 text-center">También te puede gustar</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {relatedProducts.map(rp => (
                                    <div key={rp?.id} className="group cursor-pointer" onClick={() => onViewProduct?.(rp)}>
                                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-brand-cream/10">
                                            <Media src={rp?.imagenes?.[0] || 'https://placehold.co/400x400?text=No+Image'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <p className="text-[10px] font-black text-brand-brown truncate uppercase">{rp?.nombre}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

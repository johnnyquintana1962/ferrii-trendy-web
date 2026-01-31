import React, { useState, useEffect } from 'react';

interface HeroProps {
    videos: string[];
}

export const Hero: React.FC<HeroProps> = ({ videos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const videoList = videos && videos.length > 0 ? videos : [
        '/video tienda 1.mp4',
        '/video tienda 2.mp4',
        '/video tienda 3.mp4'
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % videoList.length);
        }, 8000); // Change video every 8 seconds

        return () => clearInterval(timer);
    }, [videoList.length]);

    return (
        <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden bg-brand-brown">
            {/* Multi-Video Background with CROSS-FADE */}
            <div className="absolute inset-0">
                {videoList.map((video, idx) => {
                    const isActive = idx === currentIndex;

                    return (
                        <video
                            key={`${video}-${idx}`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onContextMenu={(e) => e.preventDefault()}
                            onTimeUpdate={(e) => {
                                // Limit to 15 seconds as requested
                                if (e.currentTarget.currentTime > 15) {
                                    e.currentTarget.currentTime = 0;
                                }
                            }}
                            onError={() => {
                                setCurrentIndex(prev => (prev + 1) % videoList.length);
                            }}
                            preload="metadata"
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out ${isActive ? 'opacity-80' : 'opacity-0'
                                }`}
                        >
                            <source src={video.includes(' ') && !video.startsWith('data:') ? encodeURI(video) : video} type="video/mp4" />
                        </video>
                    );
                })}

                {/* Overlays for depth and readability */}
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 via-transparent to-black/20 z-20" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-brand-cream to-transparent z-30 opacity-40" />
            </div>

            <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center z-40 max-w-4xl">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-brand-cream/80 text-xs md:text-sm font-black uppercase tracking-[0.5em] mb-6 block">
                        Exclusividad & Elegancia
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
                        JOYAS Y MODA <br />
                        <span className="font-serif italic font-normal text-brand-cream/90">de Vanguardia</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
                        Descubre una colección única seleccionada para resaltar tu brillo propio. Calidad premium en cada detalle.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a
                            href="#catalogo?filtro=oferta"
                            className="bg-brand-brown text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-black transition-all hover:scale-105 shadow-2xl"
                        >
                            Ver Ofertas
                        </a>
                        <a
                            href="#catalogo?filtro=nueva"
                            className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-brand-brown transition-all"
                        >
                            Nueva Colección
                        </a>
                    </div>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-12 flex gap-3">
                    {videoList.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-white' : 'w-3 bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

import React from 'react';
import { Search, Sparkles, Tag } from 'lucide-react';

export const BottomNav: React.FC = () => {
    const handleSearchClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            const searchInput = document.getElementById('global-search-input');
            searchInput?.focus();
        }, 300);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-brand-cream/80 backdrop-blur-xl border-t border-brand-brown/10 px-6 pt-3 pb-6 lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <button
                    onClick={handleSearchClick}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform flex-1"
                >
                    <div className="p-3 rounded-2xl group-hover:bg-brand-brown/5 transition-colors">
                        <Search className="w-6 h-6 text-brand-brown" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-brown/60 group-hover:text-brand-brown transition-colors">Búsqueda</span>
                </button>

                <button
                    onClick={() => {
                        window.location.hash = '#catalogo?filtro=nueva';
                        window.scrollTo({ top: document.getElementById('catalogo')?.offsetTop ? document.getElementById('catalogo')!.offsetTop - 100 : 0, behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform flex-1"
                >
                    <div className="p-3 rounded-2xl group-hover:bg-brand-brown/5 transition-colors">
                        <Sparkles className="w-6 h-6 text-brand-brown" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-brown/60 group-hover:text-brand-brown transition-colors">Novedades</span>
                </button>

                <button
                    onClick={() => {
                        window.location.hash = '#catalogo?filtro=oferta';
                        window.scrollTo({ top: document.getElementById('catalogo')?.offsetTop ? document.getElementById('catalogo')!.offsetTop - 100 : 0, behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform flex-1"
                >
                    <div className="p-3 rounded-2xl group-hover:bg-brand-brown/5 transition-colors">
                        <Tag className="w-6 h-6 text-brand-brown" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-brown/60 group-hover:text-brand-brown transition-colors">Ofertas</span>
                </button>
            </div>
        </nav>
    );
};

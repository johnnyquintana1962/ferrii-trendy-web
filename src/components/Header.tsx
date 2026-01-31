import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';

interface HeaderProps {
    cartCount: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, searchTerm, onSearchChange, onOpenCart }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Inicio', href: '#inicio', type: 'main' },
        { name: 'Ofertas', href: '#catalogo?filtro=oferta', type: 'filter' },
        { name: 'Novedades', href: '#catalogo?filtro=nueva', type: 'filter' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md shadow-sm border-b border-brand-brown/10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Mobile Menu Toggle & Logo */}
                <div className="flex-1 flex items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6 text-brand-brown" /> : <Menu className="w-6 h-6 text-brand-brown" />}
                    </button>

                    <a href="#inicio" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-brown/10 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <img src="/logo.jpg" alt="Ferrii Trendy Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="hidden sm:block text-2xl font-bold tracking-tighter text-brand-brown font-serif group-hover:opacity-70 transition-opacity">
                            Ferrii <span className="font-sans font-light">Trendy</span>
                        </div>
                    </a>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex gap-8 text-brand-brown/80 font-medium">
                    {navLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="hover:text-brand-brown transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-brown transition-all group-hover:w-full"></span>
                        </a>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                    {/* Sticky Global Search */}
                    <div className="relative max-w-[120px] sm:max-w-[200px] w-full">
                        <input
                            id="global-search-input"
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => {
                                onSearchChange(e.target.value);
                                if (window.location.hash !== '#catalogo' && e.target.value.trim() !== '') {
                                    window.location.hash = '#catalogo';
                                }
                            }}
                            className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-brand-brown outline-none focus:bg-white focus:border-brand-brown/30 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/30" />
                    </div>

                    <button
                        onClick={onOpenCart}
                        className="relative p-2 text-brand-brown hover:bg-black/5 rounded-full transition-colors active:scale-90"
                        title="Ver Carrito"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-brand-brown text-brand-cream text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-brand-cream border-b border-brand-brown/10 shadow-2xl animate-in slide-in-from-top-4 duration-300 max-h-[80vh] overflow-y-auto">
                    <nav className="flex flex-col py-6">
                        {/* Main Links */}
                        {navLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="px-8 py-4 text-lg font-bold text-brand-brown hover:bg-brand-brown/5 transition-all active:bg-brand-brown/10 border-b border-brand-brown/5"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

import React from 'react';
import { X, Trash2, Smartphone, ShoppingCart } from 'lucide-react';
import { Media } from './Media';
import { Product } from '../types';

interface CartItem extends Product {
    talle?: string;
    quantity: number;
}

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onRemoveItem: (id: string, talle?: string) => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemoveItem }) => {
    const total = items.reduce((sum, item) => sum + (item.precio || 0) * item.quantity, 0);

    const generateWhatsAppMessage = () => {
        let message = `¡Hola! Quiero hacer el siguiente pedido:%0A`;

        items.forEach(item => {
            message += `- ${item.nombre}${item.talle ? ` [Talle: ${item.talle}]` : ''} - Gs. ${item.precio?.toLocaleString('es-PY') || 'A consultar'}%0A`;
        });

        message += `---%0A`;
        message += `Total estimado: Gs. ${total.toLocaleString('es-PY')}%0A%0A`;
        message += `¿Me confirman disponibilidad?`;

        return `https://wa.me/595981630337?text=${message}`;
    };

    const whatsappLink = generateWhatsAppMessage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ring-1 ring-black/5">
                <div className="p-8 border-b border-brand-brown/10 flex justify-between items-center bg-brand-cream/30">
                    <h2 className="text-3xl font-black text-brand-brown font-serif">Mi Carrito</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full text-brand-brown transition-all active:scale-95">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center text-brand-brown/30 py-32">
                            <ShoppingCart className="w-20 h-20 mx-auto mb-6 opacity-10" />
                            <p className="text-xl font-serif italic mb-6">El carrito está esperando tu elección...</p>
                            <button
                                onClick={onClose}
                                className="bg-brand-brown text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all"
                            >
                                Seguir Navegando
                            </button>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item.id}-${item.talle || 'univ'}-${idx}`} className="flex gap-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-28 h-28 rounded-3xl overflow-hidden flex-shrink-0 bg-brand-cream/20 shadow-inner border border-brand-brown/5">
                                    <Media src={item.imagenes?.[0]} alt={item.nombre} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-brand-brown leading-tight mb-1">{item.nombre}</h3>
                                        <button
                                            onClick={() => onRemoveItem(item.id, item.talle)}
                                            className="text-red-300 hover:text-red-500 p-1 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.talle && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-brand-brown/10 text-brand-brown px-3 py-1 rounded-full">
                                                Talle: {item.talle}
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.stock_inmediato ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {item.stock_inmediato ? 'En Stock' : 'Bajo Pedido'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-400">Cant: {item.quantity}</span>
                                        </div>
                                        <span className="font-black text-brand-brown text-lg">
                                            {item.precio ? `Gs. ${(item.precio * item.quantity).toLocaleString('es-PY')}` : 'A consultar'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-10 border-t border-brand-brown/10 bg-brand-cream/20 space-y-8">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm text-brand-brown/50 font-bold uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>Gs. {total.toLocaleString('es-PY')}</span>
                            </div>
                            <div className="flex justify-between items-center text-3xl font-black text-brand-brown tracking-tighter">
                                <span>Total</span>
                                <span>Gs. {total.toLocaleString('es-PY')}</span>
                            </div>
                        </div>

                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-brand-brown text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-[0_20px_40px_-10px_rgba(78,52,46,0.3)] active:scale-95 group"
                        >
                            <Smartphone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                            Finalizar Pedido
                        </a>

                        <button
                            onClick={onClose}
                            className="w-full text-brand-brown/50 hover:text-brand-brown text-xs font-black uppercase tracking-widest text-center transition-colors pb-2"
                        >
                            ← Seguir Comprando
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

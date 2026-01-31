import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
    const whatsappNumber = "595981630337";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola! 👋 Quisiera hacer una consulta sobre la tienda Ferrii Trendy.`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
            title="Contactar por WhatsApp"
        >
            <MessageCircle className="w-8 h-8" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-brand-brown px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-brand-brown/5">
                ¿Cómo podemos ayudarte?
            </span>
        </a>
    );
};

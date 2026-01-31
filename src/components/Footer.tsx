import React from 'react';
import { Instagram, MapPin, Clock, MessageCircle } from 'lucide-react';
import { INSTAGRAM_URL, MAPS_URL, TIKTOK_URL, WHATSAPP_NUMBER } from '../constants';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-brown text-brand-cream border-t border-white/10" id="contacto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Brand Info */}
                    <div>
                        <h3 className="text-2xl font-serif font-bold mb-4">Ferrii Trendy</h3>
                        <p className="text-brand-cream/70 mb-4 max-w-sm">
                            Tu destino favorito para moda y accesorios en Ypané. Calidad, estilo y la mejor atención personalizada.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href={INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/10 rounded-full hover:bg-[#E1306C] transition-all hover:scale-110 shadow-lg"
                                title="Síguenos en Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href={TIKTOK_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/10 rounded-full hover:bg-black transition-all hover:scale-110 shadow-lg"
                                title="Síguenos en TikTok"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.06-.03-.11-.07-.17-.1v1.97c-.03 3.12-1.35 6.18-3.95 7.9-2.57 1.71-6.07 2.02-8.91.8-2.82-1.2-4.9-4-5.06-7.08-.14-3.13 1.73-6.32 4.69-7.4 2.1-.77 4.54-.53 6.43.76.01-1.38.01-2.76.01-4.14-.01-.08-.01-.15-.01-.22-.01-.01-.01-.32-.01-.32-.01-.89.04-1.78.01-2.67.01-.2 0-.41.01-.61zm-4.96 12.01c-.13 1.63 1.12 3.2 2.73 3.4 1.6.21 3.16-.92 3.41-2.51.27-1.63-.9-3.23-2.52-3.52-1.63-.29-3.27.76-3.62 2.38-.01.08-.01.16-.01.25z" /></svg>
                            </a>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/10 rounded-full hover:bg-[#25D366] transition-all hover:scale-110 shadow-lg"
                                title="Contactar por WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Contact & Hours */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">Visítanos</h4>

                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 text-brand-cream/80 hover:text-white transition-colors group bg-white/5 p-4 rounded-xl border border-white/5"
                        >
                            <MapPin className="w-6 h-6 flex-shrink-0 text-brand-cream group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="font-bold">Sucursal Ypané</p>
                                <p className="text-sm opacity-70">GFVQ+8F3, Ypané, Paraguay</p>
                                <p className="text-xs underline mt-1 text-white/50">Abrir en el mapa</p>
                            </div>
                        </a>

                        <div className="flex items-start gap-4 text-brand-cream/80 bg-white/5 p-4 rounded-xl border border-white/5">
                            <Clock className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Horarios</p>
                                <p className="text-sm">Lun - Sáb: 11:00 - 18:00</p>
                                <p className="text-green-400 font-bold text-xs mt-1 uppercase tracking-tighter">WhatsApp 24hs</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Embed */}
                    <div className="rounded-2xl overflow-hidden h-48 bg-white/5 border border-white/10 group relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.760161404176!2d-57.5244586!3d-25.4629444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDI3JzQ2LjYiUyA1N8KwMzEnMjguMSJX!5e0!3m2!1ses!2spy!4v1700000000000!5m2!1ses!2spy"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación Ferri Trendy"
                        />
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/40 transition-all text-white font-bold"
                        >
                            VER MAPA GRANDE
                        </a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-brand-cream/40 font-bold uppercase tracking-widest">
                    © {new Date().getFullYear()} Ferrii Trendy. Joyas y Moda de Vanguardia.
                </div>
            </div>
        </footer>
    );
};

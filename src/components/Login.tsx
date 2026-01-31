import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            sessionStorage.setItem('admin_session', 'active');
            onLogin();
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-brown/5 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-brand-brown/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-brand-brown/[0.02]">
                        <Lock className="w-8 h-8 text-brand-brown" />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-brand-brown tracking-tighter mb-2">Acceso Admin</h1>
                    <p className="text-brand-brown/40 font-bold uppercase tracking-widest text-[10px]">Ferrii Trendy • Área Privada</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Contraseña de Acceso</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-6 py-5 bg-brand-cream/10 border-2 rounded-2xl outline-none transition-all font-bold text-center tracking-[0.5em] text-brand-brown ${error ? 'border-red-500 animate-shake' : 'border-transparent focus:border-brand-brown focus:bg-white'}`}
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-3 animate-pulse">Contraseña Incorrecta</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-brown text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        <LogIn className="w-5 h-5" /> Entrar al Panel
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-brand-brown/5 text-center">
                    <a href="#inicio" className="text-brand-brown/40 hover:text-brand-brown font-black uppercase tracking-widest text-[10px] transition-colors">
                        ← Regresar a la Tienda
                    </a>
                </div>
            </div>
        </div>
    );
};

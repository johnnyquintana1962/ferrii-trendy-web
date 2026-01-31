import React, { useState } from 'react';
import { migrateFromLocalStorage } from '../services/firebaseService';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export const MigrationHelper: React.FC = () => {
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleMigrate = async () => {
        setMigrating(true);
        setProgress(0);
        setResult(null);

        try {
            const migrationResult = await migrateFromLocalStorage((prog) => {
                setProgress(prog);
            });

            setResult({
                success: true,
                message: `✅ Migración exitosa: ${migrationResult.migratedProducts} productos y ${migrationResult.migratedSettings} configuración migrados a Firebase.`
            });
        } catch (error: any) {
            setResult({
                success: false,
                message: `❌ Error en migración: ${error.message}`
            });
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h3 className="text-blue-700 font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Migración LocalStorage → Firebase
            </h3>
            <p className="text-blue-600 text-[10px] mb-4 font-bold uppercase tracking-widest leading-relaxed">
                Migra todos tus productos y configuración desde el navegador a la nube de Google.
            </p>

            {!result && (
                <button
                    onClick={handleMigrate}
                    disabled={migrating}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all border border-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {migrating ? `Migrando... ${progress}%` : '🚀 Iniciar Migración'}
                </button>
            )}

            {migrating && (
                <div className="mt-4">
                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-blue-600 text-xs mt-2 text-center font-bold">{progress}%</p>
                </div>
            )}

            {result && (
                <div className={`mt-4 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-xs font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                            {result.message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

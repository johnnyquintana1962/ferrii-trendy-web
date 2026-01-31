import { useState, useEffect, useCallback } from 'react';
import { Settings, Category } from '../types';
import {
    subscribeToSettings,
    updateSettings as updateSettingsInFirebase
} from '../services/firebaseService';

// Default images for categories
const getDefaultImageForCategory = (id: string): string => {
    const defaults: Record<string, string> = {
        'joyas': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000',
        'vestidos': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000',
        'carteras': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000',
        'perfumes': 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000',
        'zapatos': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
        'relojes': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000',
        'billeteras': 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000',
    };
    return defaults[id] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000';
};

const defaultSettings: Settings = {
    heroVideos: [
        '/video tienda 1.mp4',
        '/video tienda 2.mp4',
        '/video tienda 3.mp4'
    ],
    categories: [
        { id: 'joyas', name: 'Joyas', imageUrl: getDefaultImageForCategory('joyas'), order: 0 },
        { id: 'vestidos', name: 'Vestidos', imageUrl: getDefaultImageForCategory('vestidos'), order: 1 },
        { id: 'carteras', name: 'Carteras', imageUrl: getDefaultImageForCategory('carteras'), order: 2 },
        { id: 'perfumes', name: 'Perfumes', imageUrl: getDefaultImageForCategory('perfumes'), order: 3 },
    ]
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Subscribe to real-time settings updates from Firestore
    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeToSettings(async (updatedSettings) => {
            let finalSettings = { ...updatedSettings } as Settings;

            // MIGRATION: Convert old visibleCategories to new categories structure
            if (updatedSettings.visibleCategories && !updatedSettings.categories) {
                console.log('🔄 Migrating visibleCategories to categories...');
                const migratedCategories: Category[] = updatedSettings.visibleCategories.map((name, index) => ({
                    id: name.toLowerCase(),
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    imageUrl: getDefaultImageForCategory(name.toLowerCase()),
                    order: index
                }));

                finalSettings = {
                    ...updatedSettings,
                    categories: migratedCategories
                };

                // Save migrated structure to Firebase
                try {
                    await updateSettingsInFirebase(finalSettings);
                    console.log('✅ Migration completed successfully');
                } catch (error) {
                    console.error('Error saving migrated categories:', error);
                }
            }

            // Initialize with defaults if completely empty
            if (!finalSettings.categories || finalSettings.categories.length === 0) {
                if (!initialized) {
                    finalSettings = {
                        heroVideos: updatedSettings.heroVideos || defaultSettings.heroVideos,
                        categories: defaultSettings.categories
                    };

                    try {
                        await updateSettingsInFirebase(finalSettings);
                        setInitialized(true);
                    } catch (error) {
                        console.error('Error initializing default categories:', error);
                    }
                }
            }

            setSettings(finalSettings);
            setInitialized(true);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [initialized]);

    const updateSettings = useCallback(async (newSettings: Settings) => {
        try {
            await updateSettingsInFirebase(newSettings);
            // No need to update local state - subscription will handle it
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('❌ Error al actualizar configuración. Por favor, intenta nuevamente.');
            throw error;
        }
    }, []);

    return { settings, loading, updateSettings };
};

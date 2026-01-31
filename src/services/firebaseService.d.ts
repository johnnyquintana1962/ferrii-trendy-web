// Type definitions for firebaseService.js
// This file provides TypeScript type safety for the Firebase service layer

export interface FirebaseProduct {
    id?: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number | null;
    imagenes: string[];
    stock_inmediato: boolean;
    oferta: boolean;
    nueva_coleccion: boolean;
    talles?: string[];
    createdAt?: any;
    updatedAt?: any;
}

export interface FirebaseSettings {
    heroVideos: string[];
    categories: Array<{
        id: string;
        name: string;
        imageUrl: string;
        order: number;
    }>;
    visibleCategories?: string[];  // Deprecated - mantener para migración
    createdAt?: any;
    updatedAt?: any;
}

export type ProgressCallback = (progress: number) => void;

export declare function getAllProducts(): Promise<FirebaseProduct[]>;
export declare function subscribeToProducts(callback: (products: FirebaseProduct[]) => void): () => void;
export declare function addProduct(productData: Partial<FirebaseProduct>): Promise<string>;
export declare function updateProduct(productId: string, productData: Partial<FirebaseProduct>): Promise<void>;
export declare function deleteProduct(productId: string, mediaUrls?: string[]): Promise<void>;

export declare function getSettings(): Promise<FirebaseSettings>;
export declare function subscribeToSettings(callback: (settings: FirebaseSettings) => void): () => void;
export declare function updateSettings(settingsData: Partial<FirebaseSettings>): Promise<void>;

export declare function uploadFile(
    file: File,
    path: string,
    onProgress?: ProgressCallback
): Promise<string>;

export declare function deleteMediaFile(fileUrl: string): Promise<void>;

export declare function migrateFromLocalStorage(
    onProgress?: ProgressCallback
): Promise<{
    success: boolean;
    migratedProducts: number;
    migratedSettings: number;
}>;

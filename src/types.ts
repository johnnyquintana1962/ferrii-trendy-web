export interface Product {
    id: string;  // Changed from number to match Firestore auto-generated IDs
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number | null;
    imagenes: string[];
    stock_inmediato: boolean;
    oferta: boolean;
    nueva_coleccion: boolean;
    talles?: string[];
    thumbnails?: string[];  // Miniaturas livianas (~500px) paralelas a `imagenes`, para la grilla
    createdAt?: any;   // Timestamp de Firestore (opcional: productos antiguos no lo tienen)
    updatedAt?: any;
}

export interface Category {
    id: string;           // Identificador único (lowercase)
    name: string;         // Nombre mostrado
    imageUrl: string;     // URL de Firebase Storage
    order: number;        // Orden de visualización
}

export interface Settings {
    heroVideos: string[];
    categories: Category[];           // Nueva estructura con imágenes
    visibleCategories?: string[];     // Deprecated - mantener para migración
}

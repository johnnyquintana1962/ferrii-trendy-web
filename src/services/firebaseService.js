import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

// Constants
const PRODUCTS_COLLECTION = 'products';
const SETTINGS_COLLECTION = 'settings';
const STORAGE_PATH = 'ferrii-trendy-media';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

// ==================== PRODUCTS ====================

/**
 * Get all products from Firestore
 */
export const getAllProducts = async () => {
    try {
        const productsRef = collection(db, PRODUCTS_COLLECTION);
        const q = query(productsRef);
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting products:', error);
        throw error;
    }
};

/**
 * Subscribe to real-time products updates
 */
export const subscribeToProducts = (callback, onError) => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef); // Remove orderBy to prevent excluding items without createdAt

    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(products);
    }, (error) => {
        console.error('Error in products subscription:', error);
        if (onError) onError(error);
    });
};

/**
 * Add a new product to Firestore
 */
export const addProduct = async (productData) => {
    try {
        const productsRef = collection(db, PRODUCTS_COLLECTION);
        const docRef = await addDoc(productsRef, {
            ...productData,
            createdAt: Timestamp.now()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

/**
 * Update an existing product
 */
export const updateProduct = async (productId, productData) => {
    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        await updateDoc(productRef, {
            ...productData,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

/**
 * Delete a product and its associated media
 */
export const deleteProduct = async (productId, mediaUrls = []) => {
    try {
        // Delete media files from Storage
        for (const url of mediaUrls) {
            if (url.startsWith('http')) {
                await deleteMediaFile(url);
            }
        }

        // Delete product document
        const productRef = doc(db, PRODUCTS_COLLECTION, productId);
        await deleteDoc(productRef);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// ==================== SETTINGS ====================

/**
 * Get global settings
 */
export const getSettings = async () => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, 'web_config');
        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
            return snapshot.data();
        } else {
            // Return default settings if none exist
            return {
                heroVideos: [],
                visibleCategories: []
            };
        }
    } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
    }
};

/**
 * Subscribe to real-time settings updates
 */
export const subscribeToSettings = (callback) => {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'web_config');

    return onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        } else {
            callback({
                heroVideos: [],
                visibleCategories: []
            });
        }
    }, (error) => {
        console.error('Error in settings subscription:', error);
    });
};

/**
 * Update global settings
 */
export const updateSettings = async (settingsData) => {
    try {
        const settingsRef = doc(db, SETTINGS_COLLECTION, 'web_config');
        // Use setDoc with merge to create or update
        await setDoc(settingsRef, {
            ...settingsData,
            updatedAt: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// ==================== STORAGE ====================

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'products/productId' or 'hero')
 * @param {function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            reject(new Error(`El archivo excede el límite de 20MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
            return;
        }

        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const storageRef = ref(storage, `${STORAGE_PATH}/${path}/${filename}`);

        // CRITICAL: Add metadata for proper content type recognition
        const metadata = {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000'
        };

        // Start upload with metadata
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // Progress callback
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(Math.round(progress));
                }
            },
            (error) => {
                // Error callback
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                // Success callback
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteMediaFile = async (fileUrl) => {
    try {
        // Extract storage path from URL
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

        if (pathMatch && pathMatch[1]) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw - file might already be deleted
    }
};

// ==================== MIGRATION UTILITY ====================

/**
 * Migrate data from LocalStorage to Firebase
 */
export const migrateFromLocalStorage = async (onProgress) => {
    try {
        // Get data from LocalStorage
        const productsData = localStorage.getItem('ferrii-trendy-products');
        const settingsData = localStorage.getItem('ferrii-trendy-settings');

        if (!productsData && !settingsData) {
            throw new Error('No hay datos en LocalStorage para migrar');
        }

        let migratedCount = 0;
        const totalItems = (productsData ? JSON.parse(productsData).length : 0) + (settingsData ? 1 : 0);

        // Migrate products
        if (productsData) {
            const products = JSON.parse(productsData);

            for (const product of products) {
                // Skip blob URLs - they won't work after migration
                const cleanProduct = {
                    ...product,
                    imagenes: product.imagenes?.filter(url => !url.startsWith('blob:')) || []
                };

                await addProduct(cleanProduct);
                migratedCount++;

                if (onProgress) {
                    onProgress(Math.round((migratedCount / totalItems) * 100));
                }
            }
        }

        // Migrate settings
        if (settingsData) {
            const settings = JSON.parse(settingsData);
            // Filter out blob URLs from hero videos
            const cleanSettings = {
                ...settings,
                heroVideos: settings.heroVideos?.filter(url => !url.startsWith('blob:')) || []
            };

            await updateSettings(cleanSettings);
            migratedCount++;

            if (onProgress) {
                onProgress(100);
            }
        }

        return {
            success: true,
            migratedProducts: productsData ? JSON.parse(productsData).length : 0,
            migratedSettings: settingsData ? 1 : 0
        };
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
};

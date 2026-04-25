import { useState, useCallback, useEffect } from 'react';
import { Product } from '../types';
import {
    subscribeToProducts,
    addProduct as addProductToFirebase,
    updateProduct as updateProductInFirebase,
    deleteProduct as deleteProductFromFirebase
} from '../services/firebaseService';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to real-time products updates from Firestore
    useEffect(() => {
        setLoading(true);

        const unsubscribe = subscribeToProducts(
            (updatedProducts) => {
                // Sort locally so we don't exclude products missing the 'createdAt' field
                const sorted = [...(updatedProducts as Product[])].sort((a, b) => {
                    const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
                    const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
                    return timeB - timeA;
                });
                setProducts(sorted);
                setLoading(false);
            },
            (error: any) => {
                console.error("Subscription error caught in useProducts:", error);
                setLoading(false);
                alert("⚠️ Error al conectar con la base de datos (Firestore). Por favor revisa las reglas de seguridad en Firebase.");
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const addProduct = useCallback(async (newProduct: Omit<Product, 'id'>) => {
        try {
            await addProductToFirebase(newProduct);
            // No need to update local state - subscription will handle it
        } catch (error) {
            console.error('Error adding product:', error);
            alert('❌ Error al agregar producto. Por favor, intenta nuevamente.');
            throw error;
        }
    }, []);

    const updateProduct = useCallback(async (updatedProduct: Product) => {
        try {
            const { id, ...productData } = updatedProduct;
            await updateProductInFirebase(id, productData);  // ID is now string
            // No need to update local state - subscription will handle it
        } catch (error) {
            console.error('Error updating product:', error);
            alert('❌ Error al actualizar producto. Por favor, intenta nuevamente.');
            throw error;
        }
    }, []);

    const deleteProduct = useCallback(async (id: string) => {
        try {
            const product = products.find(p => p.id === id);
            const mediaUrls = product?.imagenes || [];

            await deleteProductFromFirebase(id, mediaUrls);
            // No need to update local state - subscription will handle it
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('❌ Error al eliminar producto. Por favor, intenta nuevamente.');
            throw error;
        }
    }, [products]);

    const clearDatabase = useCallback(async () => {
        if (window.confirm("¡ADVERTENCIA! Esto borrará TODOS los productos de Firebase. ¿Continuar?")) {
            try {
                // Delete all products
                for (const product of products) {
                    await deleteProductFromFirebase(product.id, product.imagenes || []);  // ID is string
                }
                alert('✅ Base de datos limpiada exitosamente');
            } catch (error) {
                console.error('Error clearing database:', error);
                alert('❌ Error al limpiar la base de datos');
            }
        }
    }, [products]);

    const refreshProducts = useCallback(() => {
        // With real-time subscriptions, manual refresh is not needed
        // But we keep the function for compatibility
        console.log('Products are auto-synced via Firestore subscription');
    }, []);

    const setAllProducts = useCallback((newProducts: Product[]) => {
        // This is mainly used for bulk operations
        // For Firebase, we'd need to implement batch writes
        console.warn('setAllProducts is not recommended with Firebase. Use individual operations.');
        setProducts(newProducts);
    }, []);

    return {
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        setAllProducts,
        refreshProducts,
        clearDatabase
    };
};

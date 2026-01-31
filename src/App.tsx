import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Footer } from './components/Footer';
import { Loading } from './components/Loading';
import { Login } from './components/Login';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BottomNav } from './components/BottomNav';
import { useProducts } from './hooks/useProducts';
import { useSettings } from './hooks/useSettings';
import { Product } from './types';
import { Suspense, lazy } from 'react';
import './utils/cleanupLocalStorage'; // Auto-cleanup old LocalStorage data

// Lazy load heavy components
const Admin = lazy(() => import('./components/Admin').then(module => ({ default: module.Admin })));
const ProductModal = lazy(() => import('./components/ProductModal').then(module => ({ default: module.ProductModal })));

interface CartItem extends Product {
    quantity: number;
    talle?: string;
}

function App() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [currentView, setCurrentView] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'oferta' | 'nueva'>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_session') === 'active');

    const { products, loading, addProduct, updateProduct, deleteProduct, setAllProducts, refreshProducts, clearDatabase } = useProducts();
    const { settings, updateSettings } = useSettings();

    // Navigation & URL Filtering Logic
    useEffect(() => {
        const handleNavigation = () => {
            const hashFull = window.location.hash;
            const hashBase = hashFull.split('?')[0];
            const params = new URLSearchParams(hashFull.split('?')[1] || '');

            const pathName = window.location.pathname.replace('/', '').toLowerCase();
            const target = (hashBase.replace('#', '') || pathName || 'inicio').toLowerCase();
            const urlFiltro = params.get('filtro');
            const urlCat = params.get('categoria');

            // Firebase real-time subscriptions handle data sync automatically

            if (target === 'admin') {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                setCurrentView('home');

                // Set Specialized Filters
                if (urlFiltro === 'oferta') setActiveFilter('oferta');
                else if (urlFiltro === 'nueva') setActiveFilter('nueva');
                else setActiveFilter('all');

                // Set Categories from dynamic settings
                const categories = (settings?.categories || []).map(c => c.id);
                if (categories.includes(target)) {
                    setSelectedCategory(target);
                } else if (urlCat && categories.includes(urlCat.toLowerCase())) {
                    setSelectedCategory(urlCat.toLowerCase());
                } else {
                    setSelectedCategory('todos');
                }

                // Scroll Logic: Improved for better reliability
                if (target !== 'inicio' && target !== '' && target !== 'admin') {
                    // Small delay to allow potential re-renders
                    setTimeout(() => {
                        const targetId = (urlFiltro || urlCat) ? 'catalogo' : target;
                        const el = document.getElementById(targetId) || document.getElementById('catalogo');

                        if (el) {
                            const offset = 100; // Header height approximately
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }, 150);
                } else if (target === 'inicio' || target === '') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        };

        handleNavigation();
        window.addEventListener('hashchange', handleNavigation);
        return () => window.removeEventListener('hashchange', handleNavigation);
    }, [refreshProducts, settings]); // Sync with settings too


    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'todos' || p.categoria.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all'
            ? true
            : activeFilter === 'oferta' ? p.oferta : p.nueva_coleccion;

        return matchesCategory && matchesSearch && matchesFilter;
    });

    const addToCart = useCallback((product: Product, talle?: string) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id && item.talle === talle);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.talle === talle)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, talle, quantity: 1 }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = (id: string, talle?: string) => {
        setCartItems(prev => prev.filter(item => !(item.id === id && item.talle === talle)));
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        sessionStorage.removeItem('admin_session');
        setIsAuthenticated(false);
        window.location.hash = '#inicio';
    };

    if (currentView === 'admin') {
        if (!isAuthenticated) {
            return <Login onLogin={() => setIsAuthenticated(true)} />;
        }

        return (
            <Suspense fallback={<Loading />}>
                <Admin
                    products={products}
                    settings={settings}
                    onAddProduct={addProduct}
                    onUpdateProduct={updateProduct}
                    onDeleteProduct={deleteProduct}
                    onLogout={handleLogout}
                    onUpdateSettings={(newSettings) => {
                        // Category sync logic - now using categories array
                        const oldCats = (settings.categories || []).map(c => c.id);
                        const newCats = (newSettings.categories || []).map(c => c.id);

                        let updatedProducts = [...products];
                        let productsChanged = false;

                        // 1. Handle Renames (index based)
                        oldCats.forEach((oldCat, idx) => {
                            const newCat = newCats[idx];
                            if (newCat && oldCat !== newCat) {
                                updatedProducts = updatedProducts.map(p =>
                                    p.categoria.toLowerCase() === oldCat
                                        ? { ...p, categoria: newCat }
                                        : p
                                );
                                productsChanged = true;
                            }
                        });

                        // 2. Handle Deletions: If a category is gone, move its products to 'Sin Categoría'
                        const removedCats = oldCats.filter(old => !newCats.includes(old));
                        if (removedCats.length > 0) {
                            updatedProducts = updatedProducts.map(p =>
                                removedCats.includes(p.categoria.toLowerCase())
                                    ? { ...p, categoria: 'Sin Categoría' }
                                    : p
                            );
                            productsChanged = true;
                        }

                        if (productsChanged) {
                            setAllProducts(updatedProducts);
                        }

                        updateSettings(newSettings);
                    }}
                    onClearDatabase={clearDatabase}
                />
            </Suspense>
        );
    }


    return (
        <div className="min-h-screen bg-brand-cream text-brand-brown font-sans selection:bg-brand-brown selection:text-white pb-20 scroll-smooth">
            <Header
                cartCount={cartCount}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenCart={() => setIsCartOpen(true)}
            />

            <main id="inicio">
                <Hero videos={settings.heroVideos} />
                {loading ? <Loading /> : (
                    <>
                        {/* 1. CATEGORÍAS PRIMERO (con botones Ofertas/Novedades incluidos) */}
                        <Categories categories={settings.categories || []} />

                        {/* 2. CATÁLOGO DIRECTO - Sin sección de Ofertas */}
                        <section id="catalogo" className="container mx-auto px-2 md:px-4 py-12 md:py-24 scroll-mt-24">

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
                                <div className="flex-1">
                                    <h2 className="text-4xl md:text-7xl font-black font-serif text-brand-brown uppercase tracking-tighter leading-none mb-4">
                                        {activeFilter === 'oferta' ? 'Grandes Ofertas' : activeFilter === 'nueva' ? 'Nueva Colección' : selectedCategory === 'todos' ? 'Nuestra Colección' : selectedCategory}
                                    </h2>
                                    <p className="text-brand-brown/40 font-black uppercase tracking-[0.4em] text-[10px]">Piezas seleccionadas con alma</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-10">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        index={index}
                                        onAddToCart={addToCart}
                                        onViewDetails={(p) => setSelectedProduct(p)}
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
            <FloatingWhatsApp />
            <BottomNav />

            <Cart
                isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}
                items={cartItems} onRemoveItem={removeFromCart}
            />

            <Suspense fallback={null}>
                <ProductModal
                    product={selectedProduct}
                    allProducts={products}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                    onViewProduct={(p) => setSelectedProduct(p)}
                />
            </Suspense>
        </div>
    );
}

export default App;

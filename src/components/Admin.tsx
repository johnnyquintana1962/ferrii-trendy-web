import React, { useState, useRef, useEffect } from 'react';
import { Product, Settings, Category } from '../types';
import { Plus, Trash2, Home, Upload, Edit3, Save, RotateCcw, Settings as SettingsIcon, ShoppingBag, Video, LogOut, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/firebaseService';
import { Media } from './Media';

interface AdminProps {
    products: Product[];
    settings: Settings;
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
    onUpdateSettings: (settings: Settings) => void;
    onClearDatabase: () => void;
    onLogout: () => void;
}

const INITIAL_FORM_STATE = {
    nombre: '',
    descripcion: '',
    categoria: '', // Start empty to force selection
    customCategoria: '',
    precio: '',
    imagenes: [] as string[],
    stock_inmediato: true,
    oferta: false,
    nueva_coleccion: false,
    talles: ''
};

export const Admin: React.FC<AdminProps> = ({ products, settings, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateSettings, onClearDatabase, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'config' | 'promotions'>('products');
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [filterCategory, setFilterCategory] = useState('todos');
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [draggedHeroIdx, setDraggedHeroIdx] = useState<number | null>(null);

    // Dynamic list state initialized defensively
    const [heroForm, setHeroForm] = useState<string[]>(Array.isArray(settings?.heroVideos) ? settings.heroVideos : []);
    const [catForm, setCatForm] = useState<Category[]>(Array.isArray(settings?.categories) ? settings.categories : []);
    const [newCatName, setNewCatName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCustomCat, setShowCustomCat] = useState(false);

    // Upload progress states
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keep forms in sync if settings changes (e.g. from other tabs)
    useEffect(() => {
        if (activeTab !== 'config') {
            if (Array.isArray(settings?.heroVideos)) {
                setHeroForm(settings.heroVideos);
            }
            if (Array.isArray(settings?.categories)) {
                setCatForm(settings.categories);
            }
        }
    }, [settings, activeTab]);

    const resetForm = () => {
        // Cleanup Blob URLs to free memory
        formData.imagenes.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });

        setFormData(INITIAL_FORM_STATE);
        setEditingId(null);
        setShowCustomCat(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        const currentCats = (settings?.categories || []).map(c => c.id);
        const isCustom = !currentCats.includes(product.categoria.toLowerCase());

        setFormData({
            nombre: product.nombre,
            descripcion: product.descripcion,
            categoria: isCustom ? 'other' : product.categoria.toLowerCase(),
            customCategoria: isCustom ? product.categoria : '',
            precio: product.precio?.toString() || '',
            imagenes: product.imagenes || [],
            stock_inmediato: product.stock_inmediato,
            oferta: product.oferta || false,
            nueva_coleccion: product.nueva_coleccion || false,
            talles: product.talles?.join(', ') || ''
        });
        setShowCustomCat(isCustom);
        setActiveTab('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            // Check size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`El archivo ${file.name} es muy pesado para esta versión (máx 10MB).`);
                return;
            }

            if (file.type.startsWith('video/')) {
                // Use URL.createObjectURL for videos to avoid localStorage bloat
                const videoUrl = URL.createObjectURL(file);
                setFormData(prev => ({
                    ...prev,
                    imagenes: [...prev.imagenes, videoUrl]
                }));
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    if (result.length > 2 * 1024 * 1024) {
                        alert("La imagen es demasiado pesada para el almacenamiento del navegador.");
                        return;
                    }
                    setFormData(prev => ({
                        ...prev,
                        imagenes: [...prev.imagenes, result]
                    }));
                };
                reader.onerror = (err) => console.error("Error leyendo archivo:", err);
                reader.readAsDataURL(file);
            }
        });
    };

    const handleLocalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadingFile(file.name);

        try {
            // Upload to Firebase Storage
            const downloadURL = await uploadFile(
                file,
                'hero',
                (progress: number) => {
                    setUploadProgress(progress);
                }
            );

            setHeroForm(prev => [...prev, downloadURL]);
            alert('✅ Video de portada subido exitosamente');
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message || '❌ Error al subir video. Por favor, intenta nuevamente.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadingFile('');
            // Reset input
            e.target.value = '';
        }
    };

    const handleSaveGlobal = async () => {
        try {
            const validVideos = heroForm.filter(v => v && v.trim() !== "");
            const validCats = catForm.filter(c => c.name && c.name.trim() !== "");

            await onUpdateSettings({
                heroVideos: validVideos,
                categories: validCats
            });
            alert('✅ ¡Configuración global guardada exitosamente!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('❌ Error al guardar configuración. Verifica la consola.');
        }
    };

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        const id = newCatName.toLowerCase().trim();
        if (catForm.some(c => c.id === id)) {
            alert("Esta categoría ya existe");
            return;
        }
        const newCategory: Category = {
            id,
            name: newCatName.charAt(0).toUpperCase() + newCatName.slice(1),
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000',
            order: catForm.length
        };
        setCatForm([...catForm, newCategory]);
        setNewCatName("");
    };

    const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, categoryIndex: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadingFile(`Subiendo imagen de ${catForm[categoryIndex].name}...`);

        try {
            const downloadURL = await uploadFile(file, 'categories', (progress) => {
                setUploadProgress(progress);
            });

            const updatedCategories = [...catForm];
            updatedCategories[categoryIndex] = {
                ...updatedCategories[categoryIndex],
                imageUrl: downloadURL
            };
            setCatForm(updatedCategories);

            alert('✅ Imagen de categoría actualizada');
        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ Error al subir imagen');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadingFile('');
            e.target.value = '';
        }
    };


    const RenderVideoPreview = ({ url }: { url: string }) => {
        if (!url) return (
            <div className="w-full aspect-video bg-red-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-red-200">
                <Video className="w-8 h-8 text-red-300 mb-2" />
                <span className="text-[10px] font-black text-red-400 uppercase">Multimedia Faltante</span>
            </div>
        );

        return (
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-brand-brown/10">
                <Media src={url} className="w-full h-full object-contain" />
            </div>
        );
    };

    // Drag and Drop Logic
    const onDragStart = (idx: number, type: 'product' | 'hero') => {
        if (type === 'product') setDraggedIdx(idx);
        else setDraggedHeroIdx(idx);
    };

    const onDragOver = (e: React.DragEvent, idx: number, type: 'product' | 'hero') => {
        e.preventDefault();
        const dragged = type === 'product' ? draggedIdx : draggedHeroIdx;
        if (dragged === null || dragged === idx) return;

        if (type === 'product') {
            const newImgs = [...formData.imagenes];
            const item = newImgs.splice(dragged, 1)[0];
            newImgs.splice(idx, 0, item);
            setFormData(prev => ({ ...prev, imagenes: newImgs }));
            setDraggedIdx(idx);
        } else {
            const newHero = [...heroForm];
            const item = newHero.splice(dragged, 1)[0];
            newHero.splice(idx, 0, item);
            setHeroForm(newHero);
            setDraggedHeroIdx(idx);
            // Persistent reordering: Auto-save hero order to settings
            onUpdateSettings({ ...settings, heroVideos: newHero });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission during upload
        if (isUploading) return;

        if (!formData.nombre) {
            alert('⚠️ El nombre del producto es obligatorio');
            return;
        }

        setIsUploading(true);
        setUploadingFile('Procesando imágenes...');

        try {
            // CRITICAL FIX: Upload all images to Firebase Storage using Promise.all
            const uploadedImageUrls: string[] = [];
            const imagesToUpload: File[] = [];

            // Separate already-uploaded URLs from new files that need uploading
            for (const img of formData.imagenes) {
                if (img.startsWith('http')) {
                    // Already uploaded to Firebase
                    uploadedImageUrls.push(img);
                } else if (img.startsWith('blob:') || img.startsWith('data:')) {
                    // Need to convert to File and upload
                    try {
                        const response = await fetch(img);
                        const blob = await response.blob();
                        const filename = `product-${Date.now()}-${imagesToUpload.length}.${blob.type.split('/')[1] || 'jpg'}`;
                        const file = new File([blob], filename, { type: blob.type });
                        imagesToUpload.push(file);
                    } catch (err) {
                        console.error('Error converting image:', err);
                    }
                }
            }

            // Upload all new files in parallel using Promise.all
            if (imagesToUpload.length > 0) {
                setUploadingFile(`Subiendo ${imagesToUpload.length} archivo(s)...`);

                const uploadPromises = imagesToUpload.map((file) =>
                    uploadFile(file, 'products', (progress) => {
                        setUploadProgress(Math.round(progress / imagesToUpload.length));
                    })
                );

                // Wait for ALL uploads to complete
                const newUrls = await Promise.all(uploadPromises);
                uploadedImageUrls.push(...newUrls);
            }

            // Now save to Firestore with all confirmed URLs
            setUploadingFile('Guardando producto...');
            const finalCategoria = showCustomCat ? formData.customCategoria : formData.categoria;
            const productData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                categoria: finalCategoria,
                precio: formData.precio ? Number(formData.precio) : null,
                imagenes: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://placehold.co/400x400?text=No+Image'],
                stock_inmediato: formData.stock_inmediato,
                oferta: formData.oferta,
                nueva_coleccion: formData.nueva_coleccion,
                talles: formData.talles ? formData.talles.split(',').map(t => t.trim()).filter(Boolean) : []
            };

            if (editingId) {
                await onUpdateProduct({ ...productData, id: editingId });
                alert('✅ ¡Producto actualizado exitosamente!');
            } else {
                await onAddProduct(productData);
                alert('✅ ¡Producto agregado exitosamente!');
            }

            resetForm();
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('❌ Error al guardar producto. Verifica la consola.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadingFile('');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col lg:flex-row relative">
            {/* BLOCKING OVERLAY DURING UPLOAD */}
            {isUploading && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-12 flex flex-col items-center gap-6 shadow-2xl max-w-md mx-4">
                        <Loader2 className="w-16 h-16 text-brand-brown animate-spin" />
                        <p className="text-brand-brown font-black text-xl text-center">Subiendo producto...</p>
                        <p className="text-brand-brown/60 text-sm text-center">{uploadingFile}</p>
                        <p className="text-brand-brown/40 text-xs text-center font-bold uppercase tracking-widest">⚠️ No cierres esta ventana</p>
                        {uploadProgress > 0 && (
                            <div className="w-full bg-brand-cream/30 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-brand-brown h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <aside className="w-full lg:w-72 bg-white border-b lg:border-r border-brand-brown/5 lg:h-screen lg:sticky lg:top-0 flex flex-col z-[60]">
                <div className="p-8 border-b border-brand-brown/5 flex items-center justify-between lg:justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-brown/10 ring-4 ring-brand-brown/5">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-serif font-black text-brand-brown text-xl tracking-tighter">Panel Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible custom-scrollbar">
                    <button onClick={() => setActiveTab('products')} className={`flex-1 lg:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-brand-brown text-white shadow-lg' : 'text-brand-brown/40 hover:bg-brand-brown/5'}`}>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Productos</span>
                    </button>
                    <button onClick={() => setActiveTab('config')} className={`flex-1 lg:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-brand-brown text-white shadow-lg' : 'text-brand-brown/40 hover:bg-brand-brown/5'}`}>
                        <SettingsIcon className="w-5 h-5" />
                        <span>Configuración Web</span>
                    </button>
                    <button onClick={() => setActiveTab('promotions')} className={`flex-1 lg:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === 'promotions' ? 'bg-brand-brown text-white shadow-lg' : 'text-brand-brown/40 hover:bg-brand-brown/5'}`}>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Promociones</span>
                    </button>
                    <div className="hidden lg:block mt-auto pt-4 border-t border-brand-brown/5">
                        <a href="#inicio" className="flex items-center gap-3 px-6 py-4 rounded-2xl text-brand-brown/60 hover:text-brand-brown font-black uppercase tracking-widest text-[10px] transition-all">
                            <Home className="w-4 h-4" /> Ver Tienda
                        </a>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-6xl pb-32">
                {activeTab === 'products' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-brand-brown font-serif tracking-tighter">Gestión de Stock</h1>
                                <p className="text-brand-brown/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Ferrii Trendy • {products.length} artículos</p>
                            </div>

                            {/* CATEGORY FILTERS */}
                            <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setFilterCategory('todos')}
                                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 ${filterCategory === 'todos' ? 'bg-brand-brown text-white border-brand-brown shadow-md scale-105' : 'bg-white text-brand-brown/40 border-brand-brown/5 hover:border-brand-brown/20'}`}
                                >
                                    todos
                                </button>
                                {(settings.categories || []).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilterCategory(cat.id)}
                                        className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 ${filterCategory === cat.id ? 'bg-brand-brown text-white border-brand-brown shadow-md scale-105' : 'bg-white text-brand-brown/40 border-brand-brown/5 hover:border-brand-brown/20'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {editingId && (
                                <button onClick={resetForm} className="flex items-center gap-2 bg-brand-cream text-brand-brown px-6 py-3 rounded-full hover:bg-white border border-brand-brown/10 transition-all font-bold text-sm shadow-sm">
                                    <RotateCcw className="w-4 h-4" /> Salir de edición
                                </button>
                            )}
                        </div>

                        <div className="grid xl:grid-cols-2 gap-12">
                            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-brand-brown/5 mb-16">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-brown/40 mb-8 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> {editingId ? 'Editar Detalles' : 'Nuevo Producto'}
                                </h2>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                                    <div>
                                        <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Nombre</label>
                                        <input type="text" className="w-full px-6 py-4 bg-brand-cream/10 border-2 border-transparent focus:border-brand-brown focus:bg-white rounded-2xl outline-none transition-all font-bold text-brand-brown" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Anillo Perlas" required />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Precio Gs.</label>
                                            <input type="number" className="w-full px-6 py-4 bg-brand-cream/10 border-2 border-transparent focus:border-brand-brown focus:bg-white rounded-2xl outline-none transition-all font-bold text-brand-brown" value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} placeholder="Consultar" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Categoría</label>
                                            <select
                                                className="w-full px-6 py-4 bg-brand-cream/10 border-2 border-transparent focus:border-brand-brown focus:bg-white rounded-2xl outline-none appearance-none transition-all font-bold text-brand-brown"
                                                value={formData.categoria}
                                                onChange={e => {
                                                    setFormData({ ...formData, categoria: e.target.value });
                                                    setShowCustomCat(e.target.value === 'other');
                                                }}
                                                required
                                            >
                                                <option value="" disabled>Seleccione una categoría...</option>
                                                {(settings.categories || []).slice().sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                                <option value="other">Otros (Especificar abajo)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {showCustomCat && (
                                        <input type="text" className="w-full px-6 py-4 bg-brand-cream/30 border-2 border-brand-brown/10 rounded-2xl outline-none font-bold text-brand-brown" value={formData.customCategoria} onChange={e => setFormData({ ...formData, customCategoria: e.target.value })} placeholder="Especificar categoría" />
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Descripción</label>
                                        <textarea
                                            className="w-full px-6 py-4 bg-brand-cream/10 border-2 border-transparent focus:border-brand-brown focus:bg-white rounded-2xl outline-none transition-all font-bold text-brand-brown min-h-[150px] resize-none"
                                            value={formData.descripcion}
                                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                            placeholder="Detalles del producto (talles, materiales, etc.)"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4 p-6 bg-brand-cream/10 rounded-[2rem] border-2 border-brand-brown/5">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-brand-brown/20 text-brand-brown focus:ring-brand-brown cursor-pointer" checked={formData.oferta} onChange={e => setFormData({ ...formData, oferta: e.target.checked })} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown group-hover:text-black transition-colors">Es Oferta</span>
                                                <span className="text-[8px] font-bold text-brand-brown/40 uppercase tracking-widest">Aparece en la sección de Ofertas</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-brand-brown/20 text-brand-brown focus:ring-brand-brown cursor-pointer" checked={formData.nueva_coleccion} onChange={e => setFormData({ ...formData, nueva_coleccion: e.target.checked })} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown group-hover:text-black transition-colors">Nueva Colección</span>
                                                <span className="text-[8px] font-bold text-brand-brown/40 uppercase tracking-widest">Aparece en Novedades</span>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-brand-brown/20 text-brand-brown focus:ring-brand-brown cursor-pointer" checked={formData.stock_inmediato} onChange={e => setFormData({ ...formData, stock_inmediato: e.target.checked })} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown group-hover:text-black transition-colors">Stock Inmediato</span>
                                                <span className="text-[8px] font-bold text-brand-brown/40 uppercase tracking-widest">Disponibilidad para entrega ahora</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-brand-brown/40 uppercase tracking-widest mb-3 px-1">Fotos / Videos del Producto (Arrastra para ordenar)</label>
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            {formData.imagenes.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    draggable
                                                    onDragStart={() => onDragStart(idx, 'product')}
                                                    onDragOver={(e) => onDragOver(e, idx, 'product')}
                                                    onDragEnd={() => setDraggedIdx(null)}
                                                    className={`relative aspect-square rounded-xl overflow-hidden group shadow-md cursor-move transition-all ${draggedIdx === idx ? 'opacity-30 scale-90 border-4 border-brand-brown' : 'opacity-100'}`}
                                                >
                                                    <Media src={img} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-brand-brown/10 flex flex-col items-center justify-center group hover:bg-brand-brown/5 transition-all cursor-pointer">
                                                <div className="bg-brand-brown/5 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                    <Plus className="w-6 h-6 text-brand-brown" />
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-brown/40">Añadir Media</span>
                                                <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isUploading
                                                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                : 'bg-brand-brown text-white hover:bg-black'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Subiendo... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {editingId ? 'Guardar Cambios' : 'Subir Producto'}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                {products
                                    .filter(p => filterCategory === 'todos' || p.categoria.toLowerCase() === filterCategory.toLowerCase())
                                    .map(product => {
                                        // Accept blob URLs as valid during session, data URLs, and http URLs
                                        const hasMultimedia = product.imagenes && product.imagenes.length > 0 &&
                                            (product.imagenes[0].startsWith('blob:') ||
                                                product.imagenes[0].startsWith('data:') ||
                                                product.imagenes[0].startsWith('http') ||
                                                product.imagenes[0].startsWith('/'));

                                        return (
                                            <div key={product.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-brand-brown/5 flex items-center gap-5 hover:shadow-lg transition-all group">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-brand-cream/20 flex items-center justify-center relative">
                                                    {!hasMultimedia && (
                                                        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
                                                            <Video className="w-6 h-6 text-red-300" />
                                                        </div>
                                                    )}
                                                    <Media src={product.imagenes?.[0] || ''} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-brand-brown truncate">{product.nombre}</h3>
                                                        {!hasMultimedia && <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Re-Subir</span>}
                                                    </div>
                                                    <p className="text-[10px] font-black text-brand-brown/30 uppercase tracking-widest">{product.categoria}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-3 bg-brand-cream text-brand-brown rounded-xl hover:bg-brand-brown hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                                                    <button onClick={() => window.confirm('¿Eliminar?') && onDeleteProduct(product.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold px-3">Borrar</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'promotions' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-12">
                            <h1 className="text-4xl font-black text-brand-brown font-serif tracking-tighter">Promociones</h1>
                            <p className="text-brand-brown/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Gestiona rápidamente el estado de tus productos</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-brand-brown/5 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-brand-cream/20">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-brown/40 border-b border-brand-brown/5">Producto</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-brown/40 border-b border-brand-brown/5">En Oferta</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-brown/40 border-b border-brand-brown/5">Nueva Colección</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-brand-cream/5 transition-colors group">
                                            <td className="px-8 py-4 border-b border-brand-brown/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                        <Media src={product.imagenes?.[0] || ''} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-bold text-brand-brown">{product.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 border-b border-brand-brown/5">
                                                <button
                                                    onClick={() => onUpdateProduct({ ...product, oferta: !product.oferta })}
                                                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${product.oferta ? 'bg-orange-100 text-orange-600 shadow-sm ring-1 ring-orange-200' : 'bg-brand-cream/40 text-brand-brown/20'}`}
                                                >
                                                    {product.oferta ? '🔥 Oferta' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-4 border-b border-brand-brown/5">
                                                <button
                                                    onClick={() => onUpdateProduct({ ...product, nueva_coleccion: !product.nueva_coleccion })}
                                                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${product.nueva_coleccion ? 'bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200' : 'bg-brand-cream/40 text-brand-brown/20'}`}
                                                >
                                                    {product.nueva_coleccion ? '✨ Nuevo' : 'Inactivo'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* MAIN HEADER */}
                        <div className="mb-20 border-b-2 border-brand-brown/5 pb-10">
                            <h1 className="text-5xl md:text-6xl font-black text-brand-brown font-serif tracking-tighter">Ajustes Web</h1>
                            <p className="text-brand-brown/30 font-bold uppercase tracking-[0.3em] text-xs mt-3 flex items-center gap-3">
                                <SettingsIcon className="w-5 h-5" /> Configura el alma de tu tienda online
                            </p>
                        </div>

                        <div className="space-y-32">
                            {/* CATEGORIES SECTION */}
                            <section className="space-y-12">
                                <div className="border-l-8 border-brand-brown pl-8 py-2">
                                    <h2 className="text-4xl font-black text-brand-brown font-serif tracking-tighter uppercase">1. Gestión de Categorías</h2>
                                    <p className="text-brand-brown/40 font-bold text-sm uppercase tracking-widest mt-2">Personaliza las secciones principales de navegación</p>
                                </div>

                                <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-brand-brown/5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-brown/20 mb-10 flex items-center gap-2">
                                        <Plus className="w-5 h-5" /> Crear Categoría Nueva
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-6 mb-16 px-2">
                                        <input
                                            type="text"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                            className="flex-1 px-8 py-6 bg-brand-cream/5 border-2 border-brand-brown/5 focus:border-brand-brown focus:bg-white rounded-3xl outline-none font-bold text-brand-brown text-xl transition-all"
                                            placeholder="Nombre: Ej. Colección Verano"
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="px-10 py-6 bg-brand-brown text-white rounded-3xl hover:bg-black transition-all font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            + Confirmar
                                        </button>
                                    </div>

                                    <div className="border-t border-brand-brown/5 pt-12">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-brown/20 mb-10 flex items-center gap-2">
                                            <SettingsIcon className="w-5 h-5" /> Categorías Activas ({catForm.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                            {catForm
                                                .map((cat, originalIdx) => ({ cat, originalIdx }))
                                                .sort((a, b) => a.cat.order - b.cat.order)
                                                .map(({ cat, originalIdx }) => (
                                                    <div key={originalIdx} className="bg-white p-8 rounded-[2.5rem] border-2 border-brand-brown/5 hover:border-brand-brown/20 transition-all hover:shadow-2xl flex flex-col gap-6 group relative">
                                                        {/* Delete Button - Absolute for cleaner card */}
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); setCatForm(catForm.filter((_, i) => i !== originalIdx)); }}
                                                            className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>

                                                        {/* Image Preview */}
                                                        <div className="aspect-square rounded-3xl overflow-hidden bg-brand-cream/10 relative">
                                                            <img
                                                                src={cat.imageUrl}
                                                                alt={cat.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Upload Button */}
                                                        <label className="w-full bg-brand-brown text-white px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-3">
                                                            <Upload className="w-4 h-4" />
                                                            Cambiar Imagen
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleCategoryImageUpload(e, originalIdx)}
                                                                className="hidden"
                                                            />
                                                        </label>

                                                        {/* Category Name */}
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-brown/30 px-2">Título de Categoría</label>
                                                            <input
                                                                type="text"
                                                                value={cat.name}
                                                                onChange={(e) => {
                                                                    const newCats = [...catForm];
                                                                    newCats[originalIdx] = {
                                                                        ...newCats[originalIdx],
                                                                        name: e.target.value,
                                                                        id: e.target.value.toLowerCase().trim()
                                                                    };
                                                                    setCatForm(newCats);
                                                                }}
                                                                className="w-full px-4 py-3 bg-brand-brown/5 border-2 border-transparent focus:border-brand-brown focus:bg-white rounded-xl outline-none font-bold text-brand-brown text-sm transition-all"
                                                            />
                                                        </div>

                                                        {/* Order Control */}
                                                        <div className="flex items-center justify-between bg-brand-cream/20 p-4 rounded-2xl">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-brown/40">Prioridad:</span>
                                                            <input
                                                                type="number"
                                                                value={cat.order}
                                                                onChange={(e) => {
                                                                    const newCats = [...catForm];
                                                                    newCats[originalIdx] = {
                                                                        ...newCats[originalIdx],
                                                                        order: parseInt(e.target.value) || 0
                                                                    };
                                                                    setCatForm(newCats);
                                                                }}
                                                                className="w-16 px-3 py-2 bg-white border-2 border-brand-brown/10 focus:border-brand-brown rounded-xl outline-none font-black text-brand-brown text-center text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            {catForm.length === 0 && (
                                                <div className="col-span-full text-center py-20 border-4 border-dashed border-brand-brown/5 rounded-[3rem]">
                                                    <p className="text-brand-brown/20 font-serif italic text-2xl">Aún no hay categorías creadas</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* VIDEOS SECTION */}
                            <section className="space-y-12">
                                <div className="border-l-8 border-brand-brown pl-8 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                    <div>
                                        <h2 className="text-4xl font-black text-brand-brown font-serif tracking-tighter uppercase">2. Vídeos de Portada</h2>
                                        <p className="text-brand-brown/40 font-bold text-sm uppercase tracking-widest mt-2">Gestiona el impacto visual de tu página de inicio</p>
                                    </div>
                                    <label className="bg-brand-brown text-white px-10 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center gap-4 hover:bg-black transition-all cursor-pointer active:scale-95 hover:scale-105">
                                        <Upload className="w-6 h-6" /> Añadir Video Nuevo
                                        <input type="file" accept="video/*" className="hidden" onChange={handleLocalVideoUpload} />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                    {(heroForm || []).map((url, idx) => (
                                        <div
                                            key={idx}
                                            draggable
                                            onDragStart={() => onDragStart(idx, 'hero')}
                                            onDragOver={(e) => onDragOver(e, idx, 'hero')}
                                            onDragEnd={() => setDraggedHeroIdx(null)}
                                            className={`bg-white p-10 rounded-[3rem] shadow-xl border border-brand-brown/5 group cursor-move transition-all hover:shadow-2xl ${draggedHeroIdx === idx ? 'opacity-30 scale-95 border-brand-brown' : 'opacity-100'}`}
                                        >
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-10 h-10 rounded-2xl bg-brand-brown text-white flex items-center justify-center font-black text-sm shadow-xl">{idx + 1}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown/30">Video de Impacto</span>
                                                </div>
                                                <button onClick={() => setHeroForm(prev => prev.filter((_, i) => i !== idx))} className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                                    <Trash2 className="w-6 h-6" />
                                                </button>
                                            </div>

                                            <div className="space-y-8">
                                                <RenderVideoPreview url={url} />
                                                <div className="p-5 bg-brand-cream/10 rounded-2xl border border-brand-brown/5">
                                                    <p className="text-[10px] font-black text-brand-brown/20 uppercase tracking-[0.2em] text-center truncate">{url}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {heroForm.length === 0 && (
                                        <div className="col-span-full bg-white/30 border-4 border-dashed border-brand-brown/5 rounded-[4rem] py-32 text-center">
                                            <Video className="w-20 h-20 mx-auto mb-8 text-brand-brown/5" />
                                            <p className="font-serif italic text-brand-brown/20 text-3xl mb-12">La portada está vacía</p>
                                            <button onClick={() => setHeroForm([""])} className="bg-brand-brown/10 text-brand-brown px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-brown hover:text-white transition-all">
                                                Subir Primer Video
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="pt-20">
                                <button onClick={handleSaveGlobal} className="w-full bg-brand-brown text-white py-10 rounded-[2.5rem] font-black uppercase tracking-[0.5em] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-6 text-2xl group">
                                    <Save className="w-8 h-8 group-hover:scale-125 transition-transform" /> Guardar Todo el Sitio
                                </button>
                            </div>

                            <section className="pt-24 border-t-2 border-red-50">
                                <h3 className="text-red-300 font-black uppercase tracking-[0.3em] text-xs mb-12 flex items-center gap-3">
                                    <Trash2 className="w-5 h-5 text-red-500" /> Zona de Seguridad & Datos
                                </h3>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="p-10 bg-green-50/50 rounded-[3rem] border-2 border-green-100 group">
                                        <h4 className="text-green-700 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                            📥 Backup de Productos
                                        </h4>
                                        <p className="text-green-600/60 text-[10px] mb-8 font-bold uppercase tracking-widest leading-relaxed">
                                            Descarga un respaldo completo en formato JSON para seguridad.
                                        </p>
                                        <button
                                            onClick={() => {
                                                const dataStr = JSON.stringify(products, null, 2);
                                                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                                const url = URL.createObjectURL(dataBlob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `ferrii-trendy-backup-${new Date().toISOString().split('T')[0]}.json`;
                                                link.click();
                                                URL.revokeObjectURL(url);
                                                alert('✅ Backup descargado exitosamente!');
                                            }}
                                            className="bg-white text-green-700 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 hover:text-white transition-all border-2 border-green-100 shadow-md w-full"
                                        >
                                            Exportar Base de Datos
                                        </button>
                                    </div>

                                    <div className="p-10 bg-red-50/50 rounded-[3rem] border-2 border-red-100 group">
                                        <h4 className="text-red-700 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                            ⚠️ Borrado Crítico
                                        </h4>
                                        <p className="text-red-600/60 text-[10px] mb-8 font-bold uppercase tracking-widest leading-relaxed">
                                            Cuidado: Esta acción eliminará permanentemente todos tus productos.
                                        </p>
                                        <button
                                            onClick={onClearDatabase}
                                            className="bg-white text-red-500 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all border-2 border-red-100 shadow-md w-full"
                                        >
                                            Limpiar Sistema Completo
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

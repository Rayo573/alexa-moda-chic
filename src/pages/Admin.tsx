import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from '@/supabase'

const Admin = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    precio_original: "",
    descuento_porcentaje: "",
    tallas: "",
    colores: "",
    stock_unidades: "",
    foto_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [descripcion, setDescripcion] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const manejarSubida = async (archivo: File) => {
    // PASO 1: Subir la imagen al Storage
    const nombreLimpio = `${Date.now()}-${archivo.name}`;
    const { data: subida, error: errorSubida } = await supabase.storage
      .from('imagenes-vestidos')
      .upload(nombreLimpio, archivo);

    if (errorSubida) {
      console.error("Error subiendo foto:", errorSubida.message);
      alert("Error al subir la imagen: " + errorSubida.message);
      return null;
    }

    console.log("✓ Foto subida al Storage");

    // PASO 2: Obtener la URL pública de esa foto
    const { data: { publicUrl } } = supabase.storage
      .from('imagenes-vestidos')
      .getPublicUrl(nombreLimpio);

    console.log("✓ URL pública obtenida:", publicUrl);
    return publicUrl;
  };

  const guardarVestido = async (nuevoVestido: any) => {
    // PASO 4: Guardar en la tabla de vestidos
    const { error: errorTabla } = await supabase
      .from('vestidos')
      .insert([nuevoVestido]);

    if (errorTabla) {
      console.error("Error detallado de Supabase:", errorTabla);
      alert("Error al guardar datos: " + errorTabla.message);
      return false;
    }

    console.log("✓ Vestido guardado en la base de datos");
    alert("¡Vestido y foto guardados con éxito!");
    
    // Recarga la página para ver el nuevo producto
    window.location.reload();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación inicial
    if (!selectedFile) {
      alert("Selecciona una foto");
      return;
    }

    setIsLoading(true);

    // PASO 1 Y 2: Subir la imagen al Storage y obtener URL
    const publicUrl = await manejarSubida(selectedFile);
    
    if (!publicUrl) {
      setIsLoading(false);
      return;
    }

    // PASO 3: Preparar los datos para enviar
    // Las tallas y colores se convierten en arrays y números en sus tipos correctos
    const datosParaEnviar = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      precio_original: parseFloat(formData.precio_original),
      descuento_porcentaje: parseInt(formData.descuento_porcentaje || "0"),
      // Convertimos el texto "S, M" en el Array que pide la base de datos
      tallas: formData.tallas.split(',').map(t => t.trim()),
      colores: formData.colores.split(',').map(c => c.trim()),
      stock_unidades: parseInt(formData.stock_unidades),
      foto_url: publicUrl, // El enlace que acabamos de crear
      descripcion: descripcion
    };
    
    // PASO 4: Guardamos el vestido con la URL de la foto
    await guardarVestido(datosParaEnviar);
    // nota: window.location.reload() se ejecuta dentro de guardarVestido
  };

  useEffect(() => {
    const verificarConexion = async () => {
      console.log("Comprobando conexión con Supabase...");
      
      // Intentamos leer la tabla de vestidos que creamos
      const { data, error } = await supabase
        .from('vestidos')
        .select('*')
        .limit(1);

      if (error) {
        console.error("❌ Error de configuración:", error.message);
        console.log("Revisa si la URL o la API Key son correctas.");
      } else {
        console.log("✅ ¡Conexión establecida con éxito!");
        console.log("Datos recibidos de la tabla vestidos:", data);
      }
    }

    verificarConexion()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h1 className="text-4xl font-display font-bold mb-8" style={{ fontFamily: "Playfair Display, serif" }}>
            Panel de Administración
          </h1>

          <section className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6">Agregar Nuevo Producto</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Vestido</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Vestido Satinado"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría del Vestido</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  <option value="15 años">Vestido de 15 años</option>
                  <option value="Graduación">Vestido de Graduación</option>
                  <option value="Boda">Vestido de Boda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio Original (€)</label>
                <input
                  type="number"
                  name="precio_original"
                  value={formData.precio_original}
                  onChange={handleChange}
                  placeholder="Ej: 129"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descuento (%)</label>
                <input
                  type="number"
                  name="descuento_porcentaje"
                  value={formData.descuento_porcentaje}
                  onChange={handleChange}
                  placeholder="Ej: 20"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tallas (separadas por coma)</label>
                <input
                  type="text"
                  name="tallas"
                  value={formData.tallas}
                  onChange={handleChange}
                  placeholder="Ej: S, M, L, XL"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Colores (separados por coma)</label>
                <input
                  type="text"
                  name="colores"
                  value={formData.colores}
                  onChange={handleChange}
                  placeholder="Ej: Rojo, Negro, Blanco"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock (Unidades)</label>
                <input
                  type="number"
                  name="stock_unidades"
                  value={formData.stock_unidades}
                  onChange={handleChange}
                  placeholder="Ej: 50"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Foto del Vestido</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="font-bold text-sm">DESCRIPCIÓN DEL VESTIDO:</label>
                <textarea
                  placeholder="Escribe aquí los detalles del vestido..."
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="border p-2 rounded-md w-full"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Subiendo imagen y guardando..." : "Agregar Producto"}
              </button>
            </form>
          </section>

          <section className="mt-12 bg-card rounded-lg p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-6">Productos Existentes</h2>
            <p className="text-foreground/70">
              La funcionalidad de gestión de productos se implementará aquí. Por ahora, los productos se pueden editar directamente en el código.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

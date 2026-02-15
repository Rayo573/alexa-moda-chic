import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from '@/supabase';

function traducirColor(color: string): string {
  const mapa: { [key: string]: string } = {
    'Rojo': '#b22222',
    'Negro': '#000000',
    'Blanco': '#ffffff',
    'Champagne': '#f7e7ce',
    'Beige': '#f5f5dc',
    'Azul': '#0000ff',
    'Verde': '#008000',
    'Dorado': '#ffd700',
    'Rosa': '#ffc0cb',
    'Gris': '#808080',
  };
  return mapa[color] || '#cccccc';
}

const ProductCard = ({ vestido, navigate }: { vestido: any; navigate: any }) => {
  return (
    <div
      onClick={() => navigate(`/producto/${vestido.id}`)}
      style={{
        fontFamily: "'Playfair Display', serif",
        textAlign: "center",
        maxWidth: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease"
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.98)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      {/* Imagen con etiquetas */}
      <div style={{
        position: "relative",
        marginBottom: "15px",
        overflow: "hidden",
        transition: "transform 0.4s ease",
        aspectRatio: "3 / 5",
        backgroundColor: "#f0f0f0"
      }}>
        <img
          src={vestido.foto_url}
          alt={vestido.nombre}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
        />
        
        {/* Badges flotantes */}
        <div style={{
          position: "absolute",
          bottom: "15px",
          left: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "5px"
        }}>
          {vestido.es_rebaja && (
            <span style={{
              background: "#c5a059",
              color: "white",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "bold"
            }}>
              -{vestido.descuento_porcentaje}%
            </span>
          )}
          <span style={{
            background: "white",
            color: "black",
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "1px"
          }}>
            NUEVO
          </span>
        </div>
      </div>

      {/* Información */}
      <div style={{ padding: "0" }}>
        <h2 style={{
          fontSize: "13px",
          fontWeight: "400",
          letterSpacing: "2px",
          margin: "10px 0",
          color: "#1a1a1a",
          textTransform: "uppercase"
        }}>
          {vestido.nombre.toUpperCase()}
        </h2>
        
        {/* Precios */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          margin: "10px 0",
          alignItems: "center"
        }}>
          <span style={{
            fontWeight: "600",
            fontSize: "16px",
            color: "#1a1a1a"
          }}>
            €{vestido.precio_final.toFixed(2)}
          </span>
          {vestido.es_rebaja && (
            <span style={{
              textDecoration: "line-through",
              color: "#a0a0a0",
              fontSize: "13px"
            }}>
              €{vestido.precio_original.toFixed(2)}
            </span>
          )}
        </div>

        {/* Círculos de colores */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "12px",
          flexWrap: "wrap"
        }}>
          {vestido.colores?.map((color: string, index: number) => (
            <span
              key={index}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                backgroundColor: traducirColor(color),
                cursor: "pointer"
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Vestidos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vestidos, setVestidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [precioOpen, setPrecioOpen] = useState(false);
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    categoria: "",
    color: "",
    precioMin: 0,
    precioMax: 500,
    talla: "",
    rebajas: false,
    ordenar: "created_at"
  });

  // Función para construir y ejecutar la query dinámicamente
  const construirYEjecutarQuery = async (filtrosActivos: any) => {
    setLoading(true);
    try {
      let query = supabase.from('vestidos').select('*');

      // Aplicar filtros dinámicamente
      if (filtrosActivos.categoria) {
        query = query.eq('categoria', filtrosActivos.categoria);
      }

      if (filtrosActivos.color) {
        query = query.contains('colores', [filtrosActivos.color]);
      }

      // Rango de precio dinámico
      if (filtrosActivos.precioMin || filtrosActivos.precioMax) {
        query = query.gte('precio_final', filtrosActivos.precioMin);
        query = query.lte('precio_final', filtrosActivos.precioMax);
      }

      if (filtrosActivos.talla) {
        query = query.contains('tallas', [filtrosActivos.talla]);
      }

      if (filtrosActivos.rebajas) {
        query = query.eq('es_rebaja', true);
      }

      // Ordenar
      if (filtrosActivos.ordenar === 'precio_asc') {
        query = query.order('precio_final', { ascending: true });
      } else if (filtrosActivos.ordenar === 'precio_desc') {
        query = query.order('precio_final', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error cargando tienda:", error.message);
        setVestidos([]);
      } else {
        console.log("✅ Vestidos cargados:", data);
        setVestidos(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    // Verificar si hay parámetro de filtro en la URL
    const searchParams = new URLSearchParams(location.search);
    const filtroURL = searchParams.get('filtro');
    
    if (filtroURL === 'rebajas') {
      // Pre-seleccionar el filtro de rebajas
      const filtrosConRebajas = { ...filters, rebajas: true };
      setFilters(filtrosConRebajas);
      construirYEjecutarQuery(filtrosConRebajas);
    } else {
      construirYEjecutarQuery(filters);
    }
  }, [location.search]);

  // Manejar cambios en filtros
  const handleFilterChange = (filterName: string, value: any) => {
    const nuevosFiltros = { ...filters, [filterName]: value };
    setFilters(nuevosFiltros);
    construirYEjecutarQuery(nuevosFiltros);
  };

  const handleToggleRebajas = () => {
    const nuevosFiltros = { ...filters, rebajas: !filters.rebajas };
    setFilters(nuevosFiltros);
    construirYEjecutarQuery(nuevosFiltros);
  };

  const filterControlStyle: React.CSSProperties = {
    height: "40px",
    minHeight: "40px",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "'Playfair Display', serif",
    cursor: "pointer",
    backgroundColor: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcfaf7" }}>
      <Navbar alwaysOpaque={true} />
      <main className="pt-28">
        <section className="w-full">
          <h1 className="titulo-seccion px-6">Vestidos</h1>

          {/* Barra de filtros */}
          <div style={{
            display: "flex",
            gap: "15px",
            padding: "20px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#fcfaf7"
          }}>
            {/* Precio - Slider Desplegable */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setPrecioOpen(!precioOpen)}
                style={{
                  ...filterControlStyle,
                  justifyContent: "center",
                  position: "relative",
                  paddingRight: "40px",
                  border: precioOpen ? "1px solid #c5a059" : "1px solid #ddd",
                  backgroundColor: precioOpen ? "#fcfaf7" : "white",
                  color: "#1a1a1a",
                  transition: "all 0.3s ease"
                }}
              >
                <span style={{ fontWeight: precioOpen ? "bold" : "normal" }}>PRECIO</span>
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    width: "14px",
                    height: "14px",
                    transition: "transform 0.18s ease",
                    transform: precioOpen ? "rotate(180deg)" : "rotate(0deg)",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transformOrigin: "center",
                    transformBox: "fill-box",
                    marginTop: "-7px",
                    color: "#1a1a1a"
                  }}
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </button>

              {/* Slider desplegado */}
              {precioOpen && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "8px",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: "220px",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {/* Slider tracks */}
                  <div style={{ position: "relative", height: "4px" }}>
                    <div style={{
                      position: "absolute",
                      width: "100%",
                      height: "2px",
                      backgroundColor: "#ddd",
                      top: "1px"
                    }} />
                    <div style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "#c5a059",
                      top: "1px",
                      left: `${(filters.precioMin / 500) * 100}%`,
                      right: `${100 - (filters.precioMax / 500) * 100}%`
                    }} />
                  </div>

                  {/* Inputs range */}
                  <div style={{ position: "relative", height: "25px", marginTop: "5px" }}>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={filters.precioMin}
                      onChange={(e) => {
                        const newMin = Math.min(Number(e.target.value), filters.precioMax);
                        setFilters((prev) => ({ ...prev, precioMin: newMin }));
                      }}
                      onMouseUp={(e) => {
                        const newMin = Math.min(Number((e.target as HTMLInputElement).value), filters.precioMax);
                        const nuevosFiltros = { ...filters, precioMin: newMin };
                        construirYEjecutarQuery(nuevosFiltros);
                      }}
                      onTouchEnd={(e) => {
                        const newMin = Math.min(Number((e.target as HTMLInputElement).value), filters.precioMax);
                        const nuevosFiltros = { ...filters, precioMin: newMin };
                        construirYEjecutarQuery(nuevosFiltros);
                      }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "5px",
                        top: "10px",
                        pointerEvents: "none",
                        WebkitAppearance: "none",
                        appearance: "none",
                        background: "transparent",
                        zIndex: "5"
                      } as any}
                    />
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={filters.precioMax}
                      onChange={(e) => {
                        const newMax = Math.max(Number(e.target.value), filters.precioMin);
                        setFilters((prev) => ({ ...prev, precioMax: newMax }));
                      }}
                      onMouseUp={(e) => {
                        const newMax = Math.max(Number((e.target as HTMLInputElement).value), filters.precioMin);
                        const nuevosFiltros = { ...filters, precioMax: newMax };
                        construirYEjecutarQuery(nuevosFiltros);
                      }}
                      onTouchEnd={(e) => {
                        const newMax = Math.max(Number((e.target as HTMLInputElement).value), filters.precioMin);
                        const nuevosFiltros = { ...filters, precioMax: newMax };
                        construirYEjecutarQuery(nuevosFiltros);
                      }}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "5px",
                        top: "10px",
                        pointerEvents: "none",
                        WebkitAppearance: "none",
                        appearance: "none",
                        background: "transparent",
                        zIndex: "4"
                      } as any}
                    />
                    
                    {/* Estilos para los thumbs */}
                    <style>{`
                      input[type='range'] {
                        -webkit-appearance: none;
                        appearance: none;
                        cursor: pointer;
                      }
                      input[type='range']::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 15px;
                        height: 15px;
                        border-radius: 50%;
                        background: #c5a059;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        pointer-events: all;
                      }
                      input[type='range']::-moz-range-thumb {
                        width: 15px;
                        height: 15px;
                        border-radius: 50%;
                        background: #c5a059;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        pointer-events: all;
                      }
                    `}</style>
                  </div>

                  {/* Valores */}
                  <div style={{
                    fontSize: "11px",
                    textAlign: "center",
                    color: "#666",
                    marginTop: "5px",
                    fontWeight: "bold"
                  }}>
                    €{filters.precioMin} - €{filters.precioMax}
                  </div>
                </div>
              )}
            </div>

            {/* Categoría */}
            <select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              style={filterControlStyle}
            >
              <option value="">CATEGORÍAS</option>
              <option value="15 años">15 Años</option>
              <option value="Graduación">Graduación</option>
              <option value="Boda">Boda</option>
            </select>

            {/* Color */}
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              style={filterControlStyle}
            >
              <option value="">COLOR</option>
              <option value="Rojo">Rojo</option>
              <option value="Negro">Negro</option>
              <option value="Blanco">Blanco</option>
              <option value="Champagne">Champagne</option>
              <option value="Beige">Beige</option>
              <option value="Azul">Azul</option>
              <option value="Rosa">Rosa</option>
            </select>

            {/* Talla */}
            <select
              value={filters.talla}
              onChange={(e) => handleFilterChange('talla', e.target.value)}
              style={filterControlStyle}
            >
              <option value="">TALLA</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>

            {/* Rebajas Toggle */}
            <button
              onClick={handleToggleRebajas}
              style={{
                ...filterControlStyle,
                border: filters.rebajas ? "1px solid #c5a059" : "1px solid #ddd",
                backgroundColor: filters.rebajas ? "#c5a059" : "white",
                color: filters.rebajas ? "white" : "#1a1a1a",
                fontWeight: filters.rebajas ? "bold" : "normal",
                transition: "all 0.3s ease"
              }}
            >
              REBAJAS
            </button>

            {/* Ordenar */}
            <select
              value={filters.ordenar}
              onChange={(e) => handleFilterChange('ordenar', e.target.value)}
              style={filterControlStyle}
            >
              <option value="created_at">NOVEDADES</option>
              <option value="precio_asc">MENOR PRECIO</option>
              <option value="precio_desc">MAYOR PRECIO</option>
            </select>
          </div>

          {/* Grid de productos */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "40px",
            padding: "20px",
            backgroundColor: "#fcfaf7"
          } as React.CSSProperties}
          className="products-grid"
          >
            <style>{`
              @media (min-width: 768px) {
                .products-grid {
                  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                }
              }
            `}</style>
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#999" }}>Filtrando productos...</p>
              </div>
            ) : vestidos.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#999" }}>No hay productos que coincidan con los filtros</p>
              </div>
            ) : (
              vestidos.map((vestido) => (
                <ProductCard key={vestido.id} vestido={vestido} navigate={navigate} />
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Vestidos;

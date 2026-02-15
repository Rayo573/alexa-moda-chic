import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vestido, setVestido] = useState<any>(null);
  const [productosRelacionados, setProductosRelacionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [cantidadRapida, setCantidadRapida] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Función para barajar array (aleatorizar)
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const { data, error } = await supabase
          .from('vestidos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error cargando producto:", error.message);
          navigate('/vestidos');
        } else {
          setVestido(data);
          if (data.tallas && data.tallas.length > 0) setTallaSeleccionada(data.tallas[0]);
          if (data.colores && data.colores.length > 0) setColorSeleccionado(data.colores[0]);

          // Cargar productos relacionados de la misma categoría (máximo 20)
          const { data: relacionados } = await supabase
            .from('vestidos')
            .select('*')
            .eq('categoria', data.categoria)
            .neq('id', id)
            .limit(20);
          
          // Barajar los productos para orden aleatorio
          if (relacionados) {
            const shuffled = shuffleArray(relacionados);
            setProductosRelacionados(shuffled);
          }
        }
      } catch (err) {
        console.error("Error:", err);
        navigate('/vestidos');
      } finally {
        setLoading(false);
      }
    };

    cargarDetalle();
  }, [id, navigate]);

  // Función para agregar al carrito (localStorage)
  const agregarAlCarrito = () => {
    if (!tallaSeleccionada) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (!colorSeleccionado) {
      alert("Por favor selecciona un color");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const item = {
      id: vestido.id,
      nombre: vestido.nombre,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
      precio_final: vestido.precio_final,
      cantidad: 1,
      foto_url: vestido.foto_url,
      categoria: vestido.categoria
    };

    // Verificar si ya existe
    const existe = carrito.find((p: any) => 
      p.id === item.id && p.talla === item.talla && p.color === item.color
    );

    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push(item);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Emitir evento personalizado para actualizar el contador
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
    
    alert(`✓ "${vestido.nombre}" agregado al carrito`);
  };

  // Función para WhatsApp
  const podremosAyudarte = () => {
    const mensaje = `Hola Alexa Moda, quisiera consultar sobre el vestido "${vestido.nombre}" en talla ${tallaSeleccionada} color ${colorSeleccionado}. Precio: €${vestido.precio_final.toFixed(2)}`;
    const numeroWhatsApp = "34664123153"; // Actualiza con tu número
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Función para abrir modal de compra rápida
  const compraRapida = () => {
    if (!tallaSeleccionada) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (!colorSeleccionado) {
      alert("Por favor selecciona un color");
      return;
    }
    setCantidadRapida(1);
    setShowQuickModal(true);
  };

  // Función para confirmar compra rápida y ir al checkout
  const handleCompraRapidaConfirm = () => {
    const pedidoDirecto = {
      id: vestido.id,
      nombre: vestido.nombre,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
      precio_final: vestido.precio_final,
      cantidad: cantidadRapida,
      foto_url: vestido.foto_url,
      categoria: vestido.categoria
    };

    localStorage.setItem('compra_directa', JSON.stringify(pedidoDirecto));
    setShowQuickModal(false);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar alwaysOpaque={true} />
        <main className="pt-28 pb-16 flex items-center justify-center">
          <p style={{ color: "#999", fontSize: "18px" }}>Cargando producto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vestido) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar alwaysOpaque={true} />
        <main className="pt-28 pb-16 flex items-center justify-center">
          <p style={{ color: "#999", fontSize: "18px" }}>Producto no encontrado</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafaf8" }}>
      <Navbar alwaysOpaque={true} />
      
      {/* MODAL DE COMPRA RÁPIDA */}
      {showQuickModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "32px",
            maxWidth: "420px",
            width: "100%",
            borderRadius: "0",
            boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            textAlign: "center"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "8px",
              letterSpacing: "2px",
              color: "#1a1a1a"
            }}>Casi tuyo...</h2>
            <p style={{
              color: "#666",
              fontSize: "14px",
              marginBottom: "24px",
              fontStyle: "italic"
            }}>¿Cuántas unidades deseas?</p>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginBottom: "32px"
            }}>
              <button 
                onClick={() => setCantidadRapida(Math.max(1, cantidadRapida - 1))}
                style={{
                  fontSize: "24px",
                  border: "1px solid #ddd",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f9f9f9"}
                onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white"}
              >
                −
              </button>
              <span style={{
                fontSize: "24px",
                fontWeight: "700",
                minWidth: "30px",
                color: "#1a1a1a"
              }}>{cantidadRapida}</span>
              <button 
                onClick={() => setCantidadRapida(cantidadRapida + 1)}
                style={{
                  fontSize: "24px",
                  border: "1px solid #ddd",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f9f9f9"}
                onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white"}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleCompraRapidaConfirm}
              style={{
                width: "100%",
                backgroundColor: "#1a1a1a",
                color: "white",
                padding: "16px",
                fontWeight: "700",
                fontSize: "13px",
                border: "none",
                borderRadius: "0",
                cursor: "pointer",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "1.5px",
                marginBottom: "12px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#333"}
              onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a"}
            >
              CONFIRMAR Y PAGAR — €{(vestido.precio_final * cantidadRapida).toFixed(2)}
            </button>
            
            <button 
              onClick={() => setShowQuickModal(false)}
              style={{
                fontSize: "11px",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "system-ui",
                letterSpacing: "0.5px",
                width: "100%",
                padding: "8px"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <main className="pt-20 pb-16">
        {/* Breadcrumb */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px 20px 20px" }}>
          <button
            onClick={() => navigate('/vestidos')}
            style={{
              background: "none",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "0.5px"
            }}
          >
            ← VOLVER A COLECCIÓN
          </button>
        </div>

        {/* Layout de dos columnas */}
        <div className="product-layout" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 420px", gap: "60px" }}>
          <style>{`
            /* Responsive tweaks for product detail mobile: keep PC look but stacked */
            @media (max-width: 767px) {
              .product-layout {
                grid-template-columns: 1fr !important;
                gap: 40px !important;
                padding: 0 12px !important;
              }
              /* Keep panel styling but place it below the gallery/info */
              .product-panel {
                position: static !important;
                top: auto !important;
                padding: 22px !important;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
                border-radius: 6px !important;
              }
              /* Gallery stays similar aspect but a bit taller on mobile */
              .product-gallery {
                aspect-ratio: 3 / 5 !important;
                margin-bottom: 20px !important;
              }
              .product-layout img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }
              .talla-grid {
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 8px !important;
              }
            }
          `}</style>
          
          {/* COLUMNA IZQUIERDA: Galería */}
          <div>
            <div className="product-gallery" style={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
                aspectRatio: "3 / 5",
                marginBottom: "20px"
              }}>
              <img
                src={vestido.foto_url}
                alt={vestido.nombre}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              {vestido.es_rebaja && (
                <div style={{
                  position: "absolute",
                  top: "25px",
                  right: "25px",
                  backgroundColor: "#c5a059",
                  color: "white",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1px"
                }}>
                  -{vestido.descuento_porcentaje}%
                </div>
              )}
            </div>

            {/* Descripción */}
            <div style={{ marginTop: "40px", borderBottom: "1px solid #e0e0e0", paddingBottom: "20px" }}>
              <h3 style={{
                fontSize: "13px",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700",
                letterSpacing: "1px",
                marginBottom: "15px",
                color: "#1a1a1a"
              }}>
                DESCRIPCIÓN
              </h3>
              <p style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.8",
                margin: 0
              }}>
                {vestido.descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: Panel Sticky */}
          <div className="product-panel" style={{
            position: "sticky",
            top: "100px",
            height: "fit-content",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "2px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
          }}>
            
            {/* Título y referencia */}
            <h1 style={{
              fontSize: "20px",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#1a1a1a",
              margin: "0 0 8px 0",
              lineHeight: "1.3"
            }}>
              {vestido.nombre.toUpperCase()}
            </h1>
            <p style={{
              fontSize: "11px",
              color: "#999",
              margin: "0 0 20px 0",
              letterSpacing: "1px",
              fontFamily: "system-ui"
            }}>
              REF. #{vestido.id}
            </p>

            {/* Precio principal */}
            <div style={{ marginBottom: "25px", paddingBottom: "25px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1a1a1a"
                }}>
                  €{vestido.precio_final.toFixed(2)}
                </span>
                {vestido.es_rebaja && (
                  <span style={{
                    fontSize: "15px",
                    textDecoration: "line-through",
                    color: "#bbb"
                  }}>
                    €{vestido.precio_original.toFixed(2)}
                  </span>
                )}
              </div>
              {vestido.es_rebaja && (
                <p style={{
                  fontSize: "12px",
                  color: "#c5a059",
                  margin: "8px 0 0 0",
                  fontWeight: "600"
                }}>
                  AHORRO: €{(vestido.precio_original - vestido.precio_final).toFixed(2)}
                </p>
              )}
            </div>

            {/* Selector de Talla */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                marginBottom: "12px",
                letterSpacing: "1.2px",
                fontFamily: "'Playfair Display', serif"
              }}>
                TALLA
              </label>
              <div className="talla-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px"
              }}>
                {vestido.tallas?.map((talla: string) => (
                  <button
                    key={talla}
                    onClick={() => setTallaSeleccionada(talla)}
                    style={{
                      padding: "12px 8px",
                      border: tallaSeleccionada === talla ? "2px solid #1a1a1a" : "1px solid #ddd",
                      borderRadius: "0",
                      fontSize: "13px",
                      fontWeight: "600",
                      backgroundColor: tallaSeleccionada === talla ? "#1a1a1a" : "white",
                      color: tallaSeleccionada === talla ? "white" : "#1a1a1a",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontFamily: "system-ui",
                      letterSpacing: "0.5px"
                    }}
                    onMouseOver={(e) => {
                      if (tallaSeleccionada !== talla) {
                        (e.target as HTMLButtonElement).style.borderColor = "#c5a059";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (tallaSeleccionada !== talla) {
                        (e.target as HTMLButtonElement).style.borderColor = "#ddd";
                      }
                    }}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                marginBottom: "12px",
                letterSpacing: "1.2px",
                fontFamily: "'Playfair Display', serif"
              }}>
                COLOR
              </label>
              <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}>
                {vestido.colores?.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setColorSeleccionado(color)}
                    style={{
                      padding: "0",
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: colorSeleccionado === color ? "3px solid #1a1a1a" : "2px solid #e0e0e0",
                      backgroundColor: traducirColor(color),
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: colorSeleccionado === color ? "0 0 0 1px white, 0 0 12px rgba(0,0,0,0.15)" : "none"
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div style={{
              backgroundColor: vestido.stock_unidades > 0 ? "#f0f8f0" : "#fff0f0",
              padding: "12px 15px",
              borderRadius: "2px",
              marginBottom: "20px",
              fontSize: "12px",
              color: vestido.stock_unidades > 0 ? "#2d7a3e" : "#c5413b"
            }}>
              {vestido.stock_unidades > 0 ? (
                <>
                  <strong>✓ EN STOCK</strong> ({vestido.stock_unidades} unidades disponibles)
                </>
              ) : (
                <>
                  <strong>✗ AGOTADO</strong>
                </>
              )}
            </div>

            {/* Botones de Acción */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* AÑADIR A LA CESTA */}
              <button
                onClick={agregarAlCarrito}
                disabled={vestido.stock_unidades === 0}
                style={{
                  padding: "15px",
                  backgroundColor: vestido.stock_unidades > 0 ? "#1a1a1a" : "#ddd",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  borderRadius: "0",
                  cursor: vestido.stock_unidades > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1.5px",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  if (vestido.stock_unidades > 0) {
                    (e.target as HTMLButtonElement).style.backgroundColor = "#333";
                  }
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                }}
              >
                AÑADIR A LA CESTA
              </button>

              {/* PODEMOS AYUDARTE (WhatsApp) */}
              <button
                onClick={podremosAyudarte}
                disabled={vestido.stock_unidades === 0}
                style={{
                  padding: "15px",
                  backgroundColor: vestido.stock_unidades > 0 ? "#00a854" : "#ddd",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  borderRadius: "0",
                  cursor: vestido.stock_unidades > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1.5px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseOver={(e) => {
                  if (vestido.stock_unidades > 0) {
                    (e.target as HTMLButtonElement).style.backgroundColor = "#008c3d";
                  }
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#00a854";
                }}
              >
                💬 PODEMOS AYUDARTE
              </button>

              {/* COMPRA RÁPIDA */}
              <button
                onClick={compraRapida}
                disabled={vestido.stock_unidades === 0}
                style={{
                  padding: "15px",
                  backgroundColor: "white",
                  color: "#1a1a1a",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "1.5px solid #1a1a1a",
                  borderRadius: "0",
                  cursor: vestido.stock_unidades > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1.5px",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  if (vestido.stock_unidades > 0) {
                    (e.target as HTMLButtonElement).style.backgroundColor = "#fcfaf7";
                  }
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "white";
                }}
              >
                COMPRA RÁPIDA ⚡
              </button>
            </div>

            {/* Info adicional en el panel */}
            <div style={{
              marginTop: "25px",
              paddingTop: "25px",
              borderTop: "1px solid #f0f0f0",
              fontSize: "12px",
              color: "#999",
              lineHeight: "1.8"
            }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>CATEGORÍA:</strong> {vestido.categoria}
              </p>
              <p style={{ margin: "0" }}>
                <strong>GARANTÍA:</strong> Satisfacción 100%
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PRODUCTOS EN LA MISMA CATEGORÍA - CARRUSEL */}
        {productosRelacionados.length > 0 && (
          <div style={{ maxWidth: "1400px", margin: "80px auto 0", padding: "0 20px" }}>
            <h2 style={{
              fontSize: "20px",
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "30px",
              color: "#1a1a1a"
            }}>
              VESTIDOS EN LA CATEGORÍA "{vestido.categoria.toUpperCase()}"
            </h2>
            
            <style>{`
              @media (max-width: 767px) {
                .carousel-arrow {
                  display: none !important;
                }
                .carousel-product {
                  flex: 0 0 calc(33.333% - 14px) !important;
                  min-width: 140px !important;
                }
              }
            `}</style>
            
            {/* Contenedor del carrusel con flechas */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "15px" }}>
              {/* Flecha izquierda */}
              <button
                className="carousel-arrow"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
                  }
                }}
                style={{
                  position: "absolute",
                  left: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  transition: "all 0.3s ease",
                  zIndex: 10
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#333";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                }}
              >
                ←
              </button>

              {/* Carrusel */}
              <div
                ref={carouselRef}
                style={{
                  display: "flex",
                  gap: "20px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                  width: "100%",
                  paddingBottom: "10px"
                }}
                className="carousel-container"
              >
                <style>{`
                  .carousel-container::-webkit-scrollbar {
                    height: 6px;
                  }
                  .carousel-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                  }
                  .carousel-container::-webkit-scrollbar-thumb {
                    background: #c5a059;
                    border-radius: 3px;
                  }
                `}</style>
                {productosRelacionados.map((prod) => (
                  <div
                    className="carousel-product"
                    key={prod.id}
                    onClick={() => navigate(`/producto/${prod.id}`)}
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      flex: "0 0 calc(25% - 16px)",
                      minWidth: "250px",
                      scrollSnapAlign: "start"
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      position: "relative",
                      aspectRatio: "3 / 5",
                      backgroundColor: "#f5f5f5",
                      overflow: "hidden",
                      marginBottom: "12px"
                    }}>
                      <img
                        src={prod.foto_url}
                        alt={prod.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      {prod.es_rebaja && (
                        <div style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          backgroundColor: "#c5a059",
                          color: "white",
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          fontFamily: "'Playfair Display', serif"
                        }}>
                          -{prod.descuento_porcentaje}%
                        </div>
                      )}
                    </div>
                    <h3 style={{
                      fontSize: "12px",
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: "600",
                      margin: "0 0 6px 0",
                      color: "#1a1a1a",
                      letterSpacing: "0.5px"
                    }}>
                      {prod.nombre}
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1a1a1a"
                      }}>
                        €{prod.precio_final.toFixed(2)}
                      </span>
                      {prod.es_rebaja && (
                        <span style={{
                          fontSize: "12px",
                          textDecoration: "line-through",
                          color: "#bbb"
                        }}>
                          €{prod.precio_original.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flecha derecha */}
              <button
                className="carousel-arrow"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
                  }
                }}
                style={{
                  position: "absolute",
                  right: "-50px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  transition: "all 0.3s ease",
                  zIndex: 10
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#333";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Carrito = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarCarrito();
    
    // Escuchar cambios en el carrito
    const handleCarritoChange = () => cargarCarrito();
    window.addEventListener('carritoActualizado', handleCarritoChange);
    window.addEventListener('storage', handleCarritoChange);
    
    return () => {
      window.removeEventListener('carritoActualizado', handleCarritoChange);
      window.removeEventListener('storage', handleCarritoChange);
    };
  }, []);

  const cargarCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    setItems(carrito);
    
    const totalCarrito = carrito.reduce((sum: number, item: any) => 
      sum + (item.precio_final * item.cantidad), 0
    );
    setTotal(totalCarrito);
  };

  const aumentarCantidad = (index: number) => {
    const nuevoCarrito = [...items];
    nuevoCarrito[index].cantidad += 1;
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    setItems(nuevoCarrito);
    cargarCarrito();
    // Notificar a otros componentes (Navbar) que el carrito cambió
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
  };

  const disminuirCantidad = (index: number) => {
    const nuevoCarrito = [...items];
    if (nuevoCarrito[index].cantidad > 1) {
      nuevoCarrito[index].cantidad -= 1;
    } else {
      nuevoCarrito.splice(index, 1);
    }
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    setItems(nuevoCarrito);
    cargarCarrito();
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
  };

  const eliminarItem = (index: number) => {
    const nuevoCarrito = items.filter((_: any, i: number) => i !== index);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    setItems(nuevoCarrito);
    cargarCarrito();
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
  };

  const procederCompra = () => {
    const listaProductos = items
      .map((item) => `• ${item.nombre} (Talla ${item.talla}, Color ${item.color}) x${item.cantidad} = €${(item.precio_final * item.cantidad).toFixed(2)}`)
      .join('\n');
    
    const mensaje = `Hola Alexa Moda, me gustaría comprar los siguientes productos:\n\n${listaProductos}\n\nTOTAL: €${total.toFixed(2)}\n\n¿Cuál es el siguiente paso?`;
    const numeroWhatsApp = "34664123153";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const vaciarCarrito = () => {
    if (confirm('¿Estás segura de que deseas vaciar el carrito?')) {
      localStorage.setItem('carrito', '[]');
      setItems([]);
      setTotal(0);
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar alwaysOpaque={true} />
        <main className="pt-28 pb-16">
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(20px, 5vw, 40px) clamp(12px, 4vw, 20px)", textAlign: "center" }}>
            <h1 style={{
              fontSize: "clamp(22px, 5vw, 28px)",
              fontFamily: "'Playfair Display', serif",
              color: "#1a1a1a",
              marginBottom: "clamp(15px, 4vw, 20px)"
            }}>
              TU CARRITO ESTÁ VACÍO
            </h1>
            <p style={{ fontSize: "clamp(13px, 3vw, 16px)", color: "#666", marginBottom: "clamp(20px, 5vw, 30px)" }}>
              Explore nuestra colección y encuentre el vestido perfecto para tu próximo evento.
            </p>
            <button
              onClick={() => navigate('/vestidos')}
              style={{
                padding: "clamp(12px, 3vw, 14px) clamp(25px, 6vw, 40px)",
                backgroundColor: "#1a1a1a",
                color: "white",
                fontSize: "clamp(11px, 2.5vw, 13px)",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "1px",
                borderRadius: "2px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "#333";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
              }}
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar alwaysOpaque={true} />
      <main className="pt-28 pb-16">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(12px, 4vw, 20px)" }}>
          
          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/vestidos')}
            style={{
              background: "none",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "clamp(11px, 2vw, 13px)",
              fontFamily: "'Playfair Display', serif",
              marginBottom: "clamp(20px, 4vw, 30px)",
              letterSpacing: "0.5px"
            }}
          >
            ← VOLVER A COLECCIÓN
          </button>

          <h1 style={{
            fontSize: "clamp(24px, 6vw, 28px)",
            fontFamily: "'Playfair Display', serif",
            color: "#1a1a1a",
            marginBottom: "clamp(25px, 5vw, 40px)",
            letterSpacing: "1px"
          }}>
            TU CARRITO
          </h1>

          <div className="carrito-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
            width: "100%"
          }}>
            <style>{`
              @media (min-width: 768px) {
                .carrito-grid {
                  grid-template-columns: 1fr 350px !important;
                  gap: 40px !important;
                }
                .carrito-resumen {
                  position: sticky !important;
                  top: 100px !important;
                }
              }
            `}</style>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "100%"
            }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "clamp(80px, 25vw, 140px) 1fr",
                    gap: "clamp(15px, 4vw, 25px)",
                    paddingBottom: "20px",
                    marginBottom: "20px",
                    borderBottom: "1px solid #e0e0e0",
                    alignItems: "start"
                  }}
                >
                  {/* Imagen */}
                  <div style={{
                    aspectRatio: "3/4",
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                    cursor: "pointer",
                    borderRadius: "2px"
                  }}
                  onClick={() => navigate(`/producto/${item.id}`)}
                  >
                    <img
                      src={item.foto_url}
                      alt={item.nombre}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>

                  {/* Detalles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 3vw, 15px)" }}>
                    <div>
                      <h3 style={{
                        fontSize: "clamp(12px, 3vw, 14px)",
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: "600",
                        margin: "0 0 6px 0",
                        color: "#1a1a1a",
                        letterSpacing: "0.5px",
                        lineHeight: "1.3"
                      }}>
                        {item.nombre}
                      </h3>
                      <p style={{
                        fontSize: "clamp(10px, 2vw, 12px)",
                        color: "#999",
                        margin: "0 0 3px 0"
                      }}>
                        <strong>Talla:</strong> {item.talla}
                      </p>
                      <p style={{
                        fontSize: "clamp(10px, 2vw, 12px)",
                        color: "#999",
                        margin: 0
                      }}>
                        <strong>Color:</strong> {item.color}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          padding: "2px"
                        }}>
                          <button
                            onClick={() => disminuirCantidad(index)}
                            style={{
                              width: "clamp(28px, 7vw, 36px)",
                              height: "clamp(28px, 7vw, 36px)",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "clamp(12px, 3vw, 16px)",
                              fontWeight: "bold"
                            }}
                          >
                            −
                          </button>
                          <span style={{
                            minWidth: "25px",
                            textAlign: "center",
                            fontSize: "clamp(11px, 2vw, 13px)",
                            fontWeight: "600"
                          }}>
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => aumentarCantidad(index)}
                            style={{
                              width: "clamp(28px, 7vw, 36px)",
                              height: "clamp(28px, 7vw, 36px)",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "clamp(12px, 3vw, 16px)",
                              fontWeight: "bold"
                            }}
                          >
                            +
                          </button>
                        </div>

                        <span style={{
                          fontSize: "clamp(13px, 3vw, 15px)",
                          fontWeight: "700",
                          color: "#1a1a1a"
                        }}>
                          €{(item.precio_final * item.cantidad).toFixed(2)}
                        </span>

                        <button
                          onClick={() => eliminarItem(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#c5413b",
                            cursor: "pointer",
                            fontSize: "clamp(10px, 2vw, 12px)",
                            fontWeight: "600",
                            fontFamily: "'Playfair Display', serif",
                            padding: "4px 8px"
                          }}
                        >
                          ELIMINAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen y botones */}
            <div className="carrito-resumen" style={{
              position: "relative",
              height: "fit-content",
              backgroundColor: "white",
              padding: "clamp(20px, 5vw, 30px)",
              border: "1px solid #e0e0e0",
              borderRadius: "2px"
            }}>
              <h2 style={{
                fontSize: "clamp(12px, 3vw, 14px)",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700",
                letterSpacing: "1.5px",
                marginBottom: "clamp(15px, 4vw, 25px)",
                color: "#1a1a1a"
              }}>
                RESUMEN
              </h2>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "clamp(11px, 2.5vw, 13px)",
                color: "#666"
              }}>
                <span>Subtotal:</span>
                <span>€{total.toFixed(2)}</span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "clamp(10px, 2vw, 12px)",
                color: "#666"
              }}>
                <span>Envío:</span>
                <span style={{ fontSize: "clamp(10px, 2vw, 11px)", fontStyle: "italic", color: "#999" }}>Se calculará en el siguiente paso</span>
              </div>

              <div style={{
                borderTop: "1px solid #e0e0e0",
                paddingTop: "12px",
                marginBottom: "clamp(15px, 4vw, 25px)",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "clamp(14px, 3vw, 16px)",
                fontWeight: "700",
                color: "#1a1a1a"
              }}>
                <span>TOTAL:</span>
                <span>€{total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 3vw, 15px)",
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  fontSize: "clamp(11px, 2.5vw, 12px)",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                  transition: "all 0.3s ease",
                  borderRadius: "2px"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#333";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                }}
              >
                FINALIZAR COMPRA
              </button>

              <button
                onClick={() => navigate('/vestidos')}
                style={{
                  width: "100%",
                  padding: "clamp(12px, 3vw, 15px)",
                  backgroundColor: "white",
                  color: "#1a1a1a",
                  fontSize: "clamp(11px, 2.5vw, 12px)",
                  fontWeight: "700",
                  border: "1.5px solid #1a1a1a",
                  cursor: "pointer",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                  transition: "all 0.3s ease",
                  borderRadius: "2px"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#fcfaf7";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "white";
                }}
              >
                SEGUIR COMPRANDO
              </button>

              <button
                onClick={vaciarCarrito}
                style={{
                  width: "100%",
                  padding: "clamp(10px, 2.5vw, 12px)",
                  backgroundColor: "transparent",
                  color: "#c5413b",
                  fontSize: "clamp(10px, 2vw, 11px)",
                  fontWeight: "600",
                  border: "1px solid #f0e0e0",
                  cursor: "pointer",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease",
                  borderRadius: "2px"
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#fff0f0";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                VACIAR CARRITO
              </button>

              <p style={{
                fontSize: "clamp(9px, 2vw, 10px)",
                color: "#999",
                marginTop: "clamp(12px, 3vw, 20px)",
                textAlign: "center",
                lineHeight: "1.5",
                fontStyle: "italic"
              }}>
                * El precio final incluye impuestos. Los gastos de envío se añaden al introducir la dirección de entrega.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Carrito;

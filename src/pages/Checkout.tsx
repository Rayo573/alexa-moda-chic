import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PAISES_UE = [
  "Alemania", "Austria", "Bélgica", "Bulgaria", "Chipre", "Croacia", "Dinamarca", 
  "Eslovaquia", "Eslovenia", "Estonia", "Finlandia", "Francia", "Grecia", "Hungría", 
  "Irlanda", "Italia", "Letonia", "Lituania", "Luxemburgo", "Malta", "Países Bajos", 
  "Polonia", "Portugal", "República Checa", "Rumanía", "Suecia"
];

const Checkout = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pais, setPais] = useState("España");
  const [zonaEspana, setZonaEspana] = useState("Peninsula");

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    telefono: ""
  });

  useEffect(() => {
    // Verificar si hay compra directa (desde ProductDetail)
    const directa = localStorage.getItem('compra_directa');
    if (directa) {
      // Si es compra rápida, mostrar solo ese producto
      const pedido = JSON.parse(directa);
      setItems([pedido]);
      
      const totalDirecta = pedido.precio_final * pedido.cantidad;
      setTotal(totalDirecta);
      
      // Limpiar la compra directa después de usarla
      localStorage.removeItem('compra_directa');
    } else {
      // Si no hay compra directa, cargar el carrito normal
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      setItems(carrito);
      
      const totalCarrito = carrito.reduce((sum: number, item: any) => 
        sum + (item.precio_final * item.cantidad), 0
      );
      setTotal(totalCarrito);
    }
  }, []);

  // Calcular envío dinámicamente basado en pais, zonaEspana y total
  const calcularEnvio = (): number | string => {
    if (pais === "España") {
      if (total >= 150) return 0;
      return zonaEspana === "Canarias" ? 10 : 5;
    } else if (PAISES_UE.includes(pais)) {
      if (total >= 200) return 0;
      return 15;
    } else if (pais === "Otro") {
      return "Consultar con proveedor";
    }
    return 0;
  };

  const shippingCost = calcularEnvio();
  const totalFinal = typeof shippingCost === "number" ? total + shippingCost : total;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Generar mensaje de WhatsApp con detalles del pedido
  const generarMensajeWhatsApp = (): string => {
    const productosTexto = items.map(item => 
      `• ${item.nombre} (${item.talla} - ${item.color}) x${item.cantidad} = €${(item.precio_final * item.cantidad).toFixed(2)}`
    ).join("\n");
    
    const mensaje = `Hola Alexa Moda,\n\nMi nombre es ${formData.nombre} ${formData.apellidos} y estoy fuera de la Unión Europea. Me gustaría consultar el envío para mi pedido:\n\n${productosTexto}\n\nSubtotal: €${total.toFixed(2)}\n\nMi teléfono: ${formData.telefono}\n\n¡Quedo atenta a tu respuesta!`;
    return mensaje;
  };

  // Validar si todos los campos están completos
  const formularioCompleto = 
    formData.nombre.trim() !== "" &&
    formData.apellidos.trim() !== "" &&
    formData.direccion.trim() !== "" &&
    formData.ciudad.trim() !== "" &&
    formData.codigoPostal.trim() !== "" &&
    formData.telefono.trim() !== "" &&
    pais !== "";

  const urlWhatsApp = `https://wa.me/34664123153?text=${encodeURIComponent(generarMensajeWhatsApp())}`;

  const handleContinuar = () => {
    // Solo proceder al pago si está dentro de UE o España
    if (pais === "Otro") {
      window.open(urlWhatsApp, "_blank");
      return;
    }

    // Aquí iría la integración con pasarela de pago (Stripe, PayPal, etc.)
    console.log("Datos para pago:", { ...formData, pais, zonaEspana, total, shippingCost });
    alert("Redirigiendo a pasarela de pago...");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcfaf7" }}>
      <Navbar alwaysOpaque={true} />
      <main className="pt-28 pb-16">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(12px, 4vw, 20px)" }}>
          <button
            onClick={() => navigate('/carrito')}
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
            ← VOLVER AL CARRITO
          </button>

          <h1 style={{
            fontSize: "clamp(24px, 6vw, 28px)",
            fontFamily: "'Playfair Display', serif",
            color: "#1a1a1a",
            marginBottom: "clamp(25px, 5vw, 40px)",
            letterSpacing: "1px"
          }}>
            FINALIZAR COMPRA
          </h1>

          <style>{`
            @media (min-width: 768px) {
              .checkout-grid {
                grid-template-columns: 1fr 380px !important;
                gap: 40px !important;
              }
              .checkout-resumen {
                position: sticky !important;
                top: 100px !important;
              }
            }
          `}</style>

          {/* Layout dos columnas */}
          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div>
              <div style={{
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
                  INFORMACIÓN DE ENTREGA
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "clamp(10px, 3vw, 15px)", marginBottom: "clamp(15px, 3vw, 20px)" }}>
                  <style>{`
                    @media (min-width: 768px) {
                      .checkout-nombres {
                        grid-template-columns: 1fr 1fr !important;
                      }
                    }
                  `}</style>
                  <div className="checkout-nombres" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "clamp(10px, 3vw, 15px)", width: "100%" }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "clamp(10px, 2vw, 11px)",
                      fontWeight: "700",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      letterSpacing: "1px",
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      NOMBRE *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      style={{
                        width: "100%",
                        padding: "clamp(10px, 2vw, 12px)",
                        border: "1px solid #ddd",
                        borderRadius: "2px",
                        fontSize: "clamp(12px, 2vw, 13px)",
                        fontFamily: "system-ui",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "clamp(10px, 2vw, 11px)",
                      fontWeight: "700",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      letterSpacing: "1px",
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      APELLIDOS *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Tus apellidos"
                      style={{
                        width: "100%",
                        padding: "clamp(10px, 2vw, 12px)",
                        border: "1px solid #ddd",
                        borderRadius: "2px",
                        fontSize: "clamp(12px, 2vw, 13px)",
                        fontFamily: "system-ui",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  </div>
                </div>

                <div style={{ marginBottom: "clamp(15px, 3vw, 20px)" }}>
                  <label style={{
                    display: "block",
                    fontSize: "clamp(10px, 2vw, 11px)",
                    fontWeight: "700",
                    marginBottom: "clamp(6px, 1.5vw, 8px)",
                    letterSpacing: "1px",
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    DIRECCIÓN COMPLETA *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Calle, número, apartamento..."
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px)",
                      border: "1px solid #ddd",
                      borderRadius: "2px",
                      fontSize: "clamp(12px, 2vw, 13px)",
                      fontFamily: "system-ui",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(10px, 3vw, 15px)", marginBottom: "clamp(15px, 3vw, 20px)" }}>
                  <style>{`
                    @media (min-width: 768px) {
                      .checkout-ciudad-cp {
                        grid-template-columns: 2fr 1fr !important;
                      }
                    }
                  `}</style>
                  <div className="checkout-ciudad-cp" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(10px, 3vw, 15px)" }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "clamp(10px, 2vw, 11px)",
                        fontWeight: "700",
                        marginBottom: "clamp(6px, 1.5vw, 8px)",
                        letterSpacing: "1px",
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        CIUDAD *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        placeholder="Tu ciudad"
                        style={{
                          width: "100%",
                          padding: "clamp(10px, 2vw, 12px)",
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          fontSize: "clamp(12px, 2vw, 13px)",
                          fontFamily: "system-ui",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "clamp(10px, 2vw, 11px)",
                        fontWeight: "700",
                        marginBottom: "clamp(6px, 1.5vw, 8px)",
                        letterSpacing: "1px",
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        CP *
                      </label>
                      <input
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        placeholder="00000"
                        style={{
                          width: "100%",
                          padding: "clamp(10px, 2vw, 12px)",
                          border: "1px solid #ddd",
                          borderRadius: "2px",
                          fontSize: "clamp(12px, 2vw, 13px)",
                          fontFamily: "system-ui",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "clamp(15px, 3vw, 20px)" }}>
                  <label style={{
                    display: "block",
                    fontSize: "clamp(10px, 2vw, 11px)",
                    fontWeight: "700",
                    marginBottom: "clamp(6px, 1.5vw, 8px)",
                    letterSpacing: "1px",
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    TELÉFONO *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+34 600 000 000"
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px)",
                      border: "1px solid #ddd",
                      borderRadius: "2px",
                      fontSize: "clamp(12px, 2vw, 13px)",
                      fontFamily: "system-ui",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "clamp(15px, 3vw, 20px)" }}>
                  <label style={{
                    display: "block",
                    fontSize: "clamp(10px, 2vw, 11px)",
                    fontWeight: "700",
                    marginBottom: "clamp(6px, 1.5vw, 8px)",
                    letterSpacing: "1px",
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    PAÍS *
                  </label>
                  <select
                    value={pais}
                    onChange={(e) => {
                      setPais(e.target.value);
                      if (e.target.value !== "España") setZonaEspana("Peninsula");
                    }}
                    style={{
                      width: "100%",
                      padding: "clamp(10px, 2vw, 12px)",
                      border: "1px solid #ddd",
                      borderRadius: "2px",
                      fontSize: "clamp(12px, 2vw, 13px)",
                      fontFamily: "system-ui",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="España">España</option>
                    {PAISES_UE.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="Otro">Fuera de la Unión Europea</option>
                  </select>
                </div>

                {pais === "España" && (
                  <div style={{ marginBottom: "clamp(15px, 3vw, 20px)" }}>
                    <label style={{
                      display: "block",
                      fontSize: "clamp(10px, 2vw, 11px)",
                      fontWeight: "700",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      letterSpacing: "1px",
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      ZONA DE ENVÍO *
                    </label>
                    <select
                      value={zonaEspana}
                      onChange={(e) => {
                        setZonaEspana(e.target.value);
                      }}
                      style={{
                        width: "100%",
                        padding: "clamp(10px, 2vw, 12px)",
                        border: "1px solid #ddd",
                        borderRadius: "2px",
                        fontSize: "clamp(12px, 2vw, 13px)",
                        fontFamily: "system-ui",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="Peninsula">Península e Islas Baleares</option>
                      <option value="Canarias">Islas Canarias</option>
                    </select>
                  </div>
                )}

                <p style={{
                  fontSize: "clamp(9px, 2vw, 10px)",
                  color: "#999",
                  fontStyle: "italic",
                  margin: 0
                }}>
                  * Campos obligatorios
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN */}
            <div className="checkout-resumen" style={{
              position: "relative",
              height: "fit-content",
              backgroundColor: "white",
              padding: "clamp(20px, 5vw, 30px)",
              border: "1px solid #e0e0e0",
              borderRadius: "2px",
              marginTop: "clamp(15px, 4vw, 0px)"
            }}>
              <h2 style={{
                fontSize: "clamp(12px, 3vw, 14px)",
                fontFamily: "'Playfair Display', serif",
                fontWeight: "700",
                letterSpacing: "1.5px",
                marginBottom: "clamp(15px, 3vw, 20px)",
                color: "#1a1a1a"
              }}>
                RESUMEN DEL PEDIDO
              </h2>

              {/* Productos */}
              <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "clamp(15px, 3vw, 20px)", paddingBottom: "clamp(15px, 3vw, 20px)", borderBottom: "1px solid #e0e0e0" }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "clamp(8px, 2vw, 12px)", marginBottom: "clamp(10px, 2.5vw, 15px)" }}>
                    <img
                      src={item.foto_url}
                      alt={item.nombre}
                      style={{
                        width: "clamp(50px, 12vw, 80px)",
                        height: "clamp(65px, 16vw, 100px)",
                        objectFit: "cover",
                        borderRadius: "2px"
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: "clamp(10px, 2vw, 11px)",
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: "600",
                        margin: "0 0 4px 0",
                        color: "#1a1a1a"
                      }}>
                        {item.nombre}
                      </p>
                      <p style={{
                        fontSize: "clamp(9px, 1.8vw, 10px)",
                        color: "#999",
                        margin: "0",
                        lineHeight: "1.4"
                      }}>
                        {item.talla} - {item.color}<br />
                        x{item.cantidad}
                      </p>
                      <p style={{
                        fontSize: "clamp(11px, 2vw, 12px)",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "4px 0 0 0"
                      }}>
                        €{(item.precio_final * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{ marginBottom: "clamp(15px, 3vw, 20px)" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "clamp(8px, 1.5vw, 10px)",
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  color: "#666"
                }}>
                  <span>Subtotal:</span>
                  <span>€{total.toFixed(2)}</span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "clamp(12px, 2vw, 15px)",
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  color: "#666"
                }}>
                  <span>Envío:</span>
                  <span style={{
                    color: pais === "Otro" ? "#f97316" : (shippingCost === 0 ? "#22c55e" : "#1a1a1a"),
                    fontWeight: pais === "Otro" ? "700" : (shippingCost === 0 ? "700" : "400")
                  }}>
                    {pais === "Otro"
                      ? "A CONSULTAR"
                      : (typeof shippingCost === "string" 
                        ? shippingCost 
                        : (shippingCost === 0 ? "GRATIS" : `€${shippingCost.toFixed(2)}`))
                    }
                  </span>
                </div>

                {typeof shippingCost === "string" && (
                  <p style={{
                    fontSize: "clamp(8px, 1.5vw, 10px)",
                    color: "#f97316",
                    marginBottom: "clamp(12px, 2vw, 15px)"
                  }}>
                    * Al estar fuera de la UE, contactaremos contigo para gestionar el envío.
                  </p>
                )}

                {/* Mensaje de incentivo para Envío Gratis */}
                {pais === "España" && total < 150 && (
                  <>
                    <p style={{
                      fontSize: "clamp(9px, 2vw, 10px)",
                      color: "#f97316",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      fontStyle: "italic"
                    }}>
                      ¡Añade <b>€{(150 - total).toFixed(2)}</b> más para tener <b>ENVÍO GRATIS</b>!
                    </p>
                    {/* Barra de progreso */}
                    <div style={{
                      width: "100%",
                      height: "4px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "2px",
                      overflow: "hidden",
                      marginBottom: "clamp(12px, 2vw, 15px)"
                    }}>
                      <div 
                        style={{
                          height: "100%",
                          backgroundColor: "#1a1a1a",
                          transition: "width 0.5s ease",
                          width: `${Math.min((total / 150) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </>
                )}

                {PAISES_UE.includes(pais) && pais !== "España" && total < 200 && (
                  <>
                    <p style={{
                      fontSize: "clamp(9px, 2vw, 10px)",
                      color: "#f97316",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      fontStyle: "italic"
                    }}>
                      ¡Añade <b>€{(200 - total).toFixed(2)}</b> más para tener <b>ENVÍO GRATIS en Europa</b>!
                    </p>
                    {/* Barra de progreso */}
                    <div style={{
                      width: "100%",
                      height: "4px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "2px",
                      overflow: "hidden",
                      marginBottom: "clamp(12px, 2vw, 15px)"
                    }}>
                      <div 
                        style={{
                          height: "100%",
                          backgroundColor: "#1a1a1a",
                          transition: "width 0.5s ease",
                          width: `${Math.min((total / 200) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </>
                )}

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  borderTop: "1px solid #e0e0e0",
                  paddingTop: "clamp(12px, 2vw, 15px)",
                  marginBottom: "clamp(20px, 4vw, 25px)"
                }}>
                  <span>TOTAL:</span>
                  <span>€{totalFinal.toFixed(2)}</span>
                </div>
              </div>

              {pais === "Otro" ? (
                <a
                  href={formularioCompleto ? urlWhatsApp : "#"}
                  target={formularioCompleto ? "_blank" : undefined}
                  rel={formularioCompleto ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!formularioCompleto) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "clamp(12px, 2vw, 15px)",
                    backgroundColor: formularioCompleto ? "#25D366" : "#ccc",
                    color: formularioCompleto ? "white" : "#666",
                    fontSize: "clamp(11px, 2.5vw, 12px)",
                    fontWeight: "700",
                    border: "none",
                    borderRadius: "2px",
                    cursor: formularioCompleto ? "pointer" : "not-allowed",
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: "1.5px",
                    marginBottom: "clamp(12px, 2vw, 15px)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                    opacity: formularioCompleto ? 1 : 0.6
                  }}
                  onMouseOver={(e) => {
                    if (formularioCompleto) {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1fa854";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (formularioCompleto) {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25D366";
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  CONTACTAR CON NOSOTROS
                </a>
              ) : (
                <button
                  onClick={handleContinuar}
                  disabled={!formularioCompleto}
                  style={{
                    width: "100%",
                    padding: "clamp(12px, 2vw, 15px)",
                    backgroundColor: formularioCompleto ? "#1a1a1a" : "#ccc",
                    color: formularioCompleto ? "white" : "#666",
                    fontSize: "clamp(11px, 2.5vw, 12px)",
                    fontWeight: "700",
                    border: "none",
                    borderRadius: "2px",
                    cursor: formularioCompleto ? "pointer" : "not-allowed",
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: "1.5px",
                    marginBottom: "clamp(12px, 2vw, 15px)",
                    transition: "all 0.3s ease",
                    opacity: formularioCompleto ? 1 : 0.6
                  }}
                  onMouseOver={(e) => {
                    if (formularioCompleto) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#333";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (formularioCompleto) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                    }
                  }}
                >
                  CONTINUAR CON EL PAGO
                </button>
              )}

              <p style={{
                fontSize: "clamp(8px, 1.5vw, 10px)",
                color: "#999",
                textAlign: "center",
                margin: 0,
                fontStyle: "italic",
                lineHeight: "1.4"
              }}>
                * Al hacer clic, serás redirigido de forma segura a nuestra pasarela de pago.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

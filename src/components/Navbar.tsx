import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Moda Colombiana", href: "/moda-colombiana.html" },
  { label: "Vestidos", href: "/vestidos" },
  { label: "Contacto", href: "#social-connect" },
];

const Navbar = ({ alwaysOpaque = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [carritoCount, setCarritoCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Actualizar contador del carrito
  useEffect(() => {
    const actualizarCarrito = () => {
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      // Sumar la propiedad `cantidad` de cada elemento (por si existen múltiples unidades del mismo vestido)
      const total = carrito.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
      setCarritoCount(total);
    };

    actualizarCarrito();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => actualizarCarrito();
    window.addEventListener('storage', handleStorageChange);
    
    // Evento personalizado para cambios locales
    window.addEventListener('carritoActualizado', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('carritoActualizado', handleStorageChange);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        alwaysOpaque || scrolled
          ? "bg-card/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="/" className="font-display font-bold text-xl md:text-2xl">
          <span className={alwaysOpaque || scrolled ? "text-foreground" : "text-primary-foreground"}>
            Alexa Moda
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`font-body text-sm font-medium transition-colors hover:opacity-70 ${
                alwaysOpaque || scrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              {l.label}
            </a>
          ))}

          {/* Icono del carrito */}
          <button
            onClick={() => navigate('/carrito')}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <ShoppingBag 
              className={alwaysOpaque || scrolled ? "text-foreground" : "text-primary-foreground"}
              size={24}
            />
            {carritoCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-12px",
                backgroundColor: "#1a1a1a",
                color: "white",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "bold",
                fontFamily: "system-ui"
              }}>
                {carritoCount > 99 ? '99+' : carritoCount}
              </span>
            )}
          </button>

          <a
            href="https://wa.me/34664123153"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-secondary text-secondary-foreground font-body font-semibold text-sm rounded-full hover:scale-105 transition-transform"
          >
            WhatsApp
          </a>
        </div>

        {/* Mobile: carrito + hamburguesa */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => navigate('/carrito')}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <ShoppingBag 
              className={alwaysOpaque || scrolled ? "text-foreground" : "text-primary-foreground"}
              size={20}
            />
            {carritoCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                backgroundColor: "#1a1a1a",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                fontFamily: "system-ui"
              }}>
                {carritoCount > 99 ? '99+' : carritoCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className={`p-2 ${alwaysOpaque || scrolled ? "text-foreground" : "text-primary-foreground"}`}
            aria-label="Menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-card/95 backdrop-blur-md border-t border-border"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-body text-foreground font-medium text-lg py-2"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="https://wa.me/34664123153"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-3 bg-[#25D366] text-[#fff] font-body font-bold text-base rounded-full text-center"
              >
                WhatsApp 💬
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

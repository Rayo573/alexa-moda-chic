import { motion } from "framer-motion";
import heroImage from "@/assets/hero-boutique.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Colección de vestidos elegantes y coloridos en Alexa Moda Boutique"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-secondary font-body text-sm tracking-[0.25em] uppercase mb-4"
          >
            Alexa Moda Boutique · Alcobendas
          </motion.p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.1] mb-6">
            Saca tu mejor versión.{" "}
            <span className="italic text-secondary">Sin filtros,</span>{" "}
            solo tú.
          </h1>

          <p className="text-primary-foreground/80 font-body text-lg md:text-xl mb-8 max-w-md leading-relaxed">
            Encuentra el vestido que te haga sentir increíble. ¡Estamos en el corazón de Alcobendas!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#galeria"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-body font-semibold text-base rounded-full hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              ¡Quiero verlo todo! ✨
            </a>
            <a
              href="https://wa.me/34664123153"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-body font-medium text-base rounded-full hover:bg-primary-foreground/10 transition-colors duration-300"
            >
              Escríbenos por WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/40 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-[90vh] flex items-center bg-background bg-linen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-accent font-body text-sm tracking-[0.25em] uppercase mb-6"
          >
            Alexa Moda Boutique · Alcobendas
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] mb-6"
          >
            Saca tu mejor{" "}
            <span className="italic text-gradient-forest">versión.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground font-body text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed"
          >
            Vestidos que enamoran, tallas reales y un trato cercano. Encuentra tu look en el corazón de Alcobendas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#galeria"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-body font-semibold text-base rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
            >
              Ver colección ✨
            </a>
            <a
              href="https://wa.me/34664123153"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-body font-medium text-base rounded-full hover:bg-muted transition-colors duration-300"
            >
              Escríbenos por WhatsApp
            </a>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex justify-center mt-16"
        >
          <a href="#galeria" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <ArrowDown className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

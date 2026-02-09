import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#ddb5bf] py-10">
      <div className="container mx-auto px-6 text-center">
        <p className="font-display text-xl font-bold text-white mb-2">
          Alexa Moda Boutique
        </p>
        <p className="text-white font-body text-sm mb-4">
          C. de la Marquesa Viuda de Aldama, 40 · Alcobendas, Madrid
        </p>
        <div className="flex items-center justify-center gap-1 text-white font-body text-sm">
          Hecho con <Heart className="w-4 h-4 fill-white text-white mx-1" /> en Alcobendas
        </div>
      </div>
    </footer>
  );
};

export default Footer;

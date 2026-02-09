import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import rebajasImg from "@/assets/rebajas2.png";
import novedadesImg from "@/assets/Novedades.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background home-text-shadow">
      <Navbar />
      <main>
        <HeroSection />


        <div className="banners-principales">
          <a href="/rebajas.html" aria-label="Ver rebajas" className="banner-box rebajas">
            <img src={rebajasImg} alt="Rebajas" />
          </a>
          <a href="/novedades.html" aria-label="Ver novedades" className="banner-box novedades">
            <img src={novedadesImg} alt="Novedades" />
          </a>
        </div>

        <section className="trust-bar">
          <div className="trust-item">
            <i className="fas fa-truck"></i>
            Envío Gratis
          </div>
          <div className="trust-item">
            <i className="fas fa-lock"></i>
            Pago Seguro
          </div>
          <div className="trust-item">
            <i className="fas fa-headset"></i>
            Asesoría Personalizada
          </div>
        </section>

        <section className="featured-testimonial">
          <span className="quote-icon">"</span>
          <p>El vestido de fiesta me quedó perfecto, la atención es increíble</p>
          <div className="stars">★★★★★</div>
        </section>

        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Lo que dicen nuestras clientas</h2>
            <div className="rating-summary">
              <span className="score">4.9</span>
              <span className="stars">★★★★★</span>
              <span className="total">217 reseñas en Google</span>
            </div>
          </div>

          <div className="reviews-slider">
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>"Tienda 100% recomendable, vestidos preciosos a muy buen precio y muchas tallas. La dueña es un amor, me ayudó en todo."</p>
              <cite>- Minerva Jiménez</cite>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>"Encontré el vestido perfecto para una boda. Era lo que buscaba, verde hermoso en tela satén. Trato inmejorable."</p>
              <cite>- Katherin Salazar</cite>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>"Alexandra es muy amable y siempre está pendiente para ayudar con los arreglos para que el vestido se adapte al cuerpo."</p>
              <cite>- Esther Casas</cite>
            </div>
          </div>
          
          <div className="cta-google">
            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Ver todas las reseñas en Google</a>
          </div>
        </section>

        <section className="social-connect" id="social-connect">
          <h3>Síguenos en nuestras redes</h3>
          <div className="social-icons-container">
            <a href="https://www.instagram.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="social-box inst">
              <i className="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
            
            <a href="https://www.tiktok.com/@TU_USUARIO" target="_blank" rel="noopener noreferrer" className="social-box tik">
              <i className="fab fa-tiktok"></i>
              <span>TikTok</span>
            </a>
            
            <a href="https://www.facebook.com/TU_USUARIO" target="_blank" rel="noopener noreferrer" className="social-box fac">
              <i className="fab fa-facebook-f"></i>
              <span>Facebook</span>
            </a>

            <a href="https://wa.me/34tu_numero" target="_blank" rel="noopener noreferrer" className="social-box wha">
              <i className="fab fa-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

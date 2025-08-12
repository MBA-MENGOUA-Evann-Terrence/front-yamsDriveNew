<template>
  <div class="home-content">
    <!-- Section Hero (Head) -->
    <section class="hero-section">
      <div class="container-fluid h-100">
        <div class="row align-items-center h-100">
          <div class="col-lg-5 text-content">
            <div class="text-container">
              <div class="animated-text-wrapper">
                <h1 class="hero-title animate-text">L'avenir du stockage cloud est ici</h1>
              </div>
              <p class="hero-subtitle animate-text-delay-1">Une révolution dans la gestion des fichiers, sécurité renforcée et collaboration en temps réel.</p>
              <button class="btn btn-demo animate-text-delay-2">
                <i class="fas fa-play-circle me-2"></i> Voir la démo
              </button>
            </div>
          </div>
          <div class="col-lg-7 files-content">
            <div class="floating-files-container">
              <!-- Cartes de fichiers flottantes avec effet 3D circulaire -->
              <div class="floating-3d-container">
                <div class="file-card card-red floating-card" style="--delay: 0s; --rotate: -8deg; --z-index: 4; --top: -30px; --left: -20px;">
                  <div class="file-card-inner">
                    <div class="file-icon"><i class="fas fa-file-pdf"></i></div>
                    <div class="file-name">Rapport_annuel.pdf</div>
                    <div class="file-info">
                      <span>2.3 MB</span>
                      <span>10.5 jours</span>
                    </div>
                  </div>
                </div>
                
                <div class="file-card card-yellow floating-card" style="--delay: 1s; --rotate: 5deg; --z-index: 3; --top: -80px; --left: 40px;">
                  <div class="file-card-inner">
                    <div class="file-icon"><i class="fas fa-file-archive"></i></div>
                    <div class="file-name">Assets.zip</div>
                    <div class="file-info">
                      <span>23.0 MB</span>
                      <span>10.94864 jours</span>
                    </div>
                  </div>
                </div>
                
                <div class="file-card card-green floating-card" style="--delay: 2s; --rotate: -3deg; --z-index: 2; --top: 20px; --left: 60px;">
                  <div class="file-card-inner">
                    <div class="file-icon"><i class="fas fa-file-image"></i></div>
                    <div class="file-name">Design_concept.jpg</div>
                    <div class="file-info">
                      <span>1.5 MB</span>
                      <span>3 jours</span>
                    </div>
                  </div>
                </div>
                
                <div class="file-card card-blue floating-card" style="--delay: 3s; --rotate: 2deg; --z-index: 1; --top: 70px; --left: -10px;">
                  <div class="file-card-inner">
                    <div class="file-icon"><i class="fas fa-file-word"></i></div>
                    <div class="file-name">Document.docx</div>
                    <div class="file-info">
                      <span>3.2 MB</span>
                      <span>5 jours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section "Prêt pour la révolution du cloud?" -->
    <section class="cloud-revolution-section">
      <div class="container text-center">
        <h2 class="revolution-title animate-on-scroll">Prêt pour la révolution du cloud?</h2>
        <p class="revolution-subtitle animate-on-scroll">Rejoignez l'élite des entreprises qui transforment leur gestion des données</p>
        <button class="btn btn-start glow-effect animate-on-scroll" @click="redirectToDashboard">
          Démarrer maintenant <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'HomeContentView',
  setup() {
    const router = useRouter();
    const store = useStore();

    const redirectToDashboard = () => {
      console.log('Bouton "Démarrer maintenant" cliqué');
      if (store.getters.isAuthenticated) {
        console.log('Utilisateur authentifié, redirection vers /dashboard');
        router.push('/dashboard');
      } else {
        console.log('Utilisateur non authentifié, redirection vers /connexion');
        router.push('/connexion');
      }
    };

    onMounted(() => {
      const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll-visible');
            observer.unobserve(entry.target);
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: null,
        threshold: 0.1
      });

      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => {
        observer.observe(el);
      });
    });

    return {
      redirectToDashboard
    };
  }
});
</script>

<style scoped>
/* Styles pour la section hero */
.home-content {
  margin: 0;
  padding: 0;
  width: 100%;
}

.hero-section {
  background-color: #0a142b;
  color: white;
  padding: 80px 0;
  margin-top: 0;
  position: relative;
  overflow: hidden;
  min-height: 600px;
}

.animated-text-wrapper {
  animation: textFloat 3s ease-in-out infinite;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: #ffffff;
  background: linear-gradient(to right, #ffffff, #a8b8d8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -0.5px;
  animation: colorChange 8s infinite alternate;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  opacity: 0.85;
  line-height: 1.6;
  font-weight: 400;
  max-width: 90%;
  font-family: 'Roboto', sans-serif;
}

.btn-demo {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.btn-demo:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  color: white;
  text-decoration: none;
}

/* Styles pour les cartes de fichiers flottantes */
.floating-files-container {
  position: relative;
  height: 500px;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-left: 50px;
}

.text-content {
  padding-right: 30px;
}

.files-content {
  padding-left: 30px;
}

.floating-3d-container {
  position: relative;
  width: 100%;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
  margin: 0 auto;
}

.file-card {
  position: absolute;
  width: 220px;
  background-color: white;
  border-radius: 15px;
  padding: 1rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  transition: all 0.6s ease;
  transform-style: preserve-3d;
  z-index: var(--z-index);
}

.floating-card {
  animation: float 6s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: translateZ(0) translateY(0) rotate(var(--rotate));
  top: calc(50% - 70px + var(--top, 0px));
  left: calc(50% - 110px + var(--left, 0px));
}

.file-card:hover {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  transform: translateZ(30px) translateY(-10px) rotate(calc(var(--rotate) * 1.5)) !important;
}

.file-card:hover .file-card-inner {
  transform: rotateY(10deg) rotateX(5deg);
}

.file-card-inner {
  transition: transform 0.6s ease-in-out;
  transform-style: preserve-3d;
  padding: 5px;
}

.file-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #4285F4;
}

.card-red {
  border-left: 4px solid #EA4335;
}

.card-yellow {
  border-left: 4px solid #FBBC05;
}

.card-green {
  border-left: 4px solid #34A853;
}

.card-blue {
  border-left: 4px solid #4285F4;
}

.file-icon i.fa-file-pdf {
  color: #EA4335;
}

.file-icon i.fa-file-archive {
  color: #FBBC05;
}

.file-icon i.fa-file-image {
  color: #34A853;
}

.file-icon i.fa-file-word {
  color: #4285F4;
}

.file-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.file-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-section {
    padding: 3rem 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .floating-files-container {
    height: 300px;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
/* Animations pour le texte et le bouton */
.animate-text {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-text-delay-1 {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out 0.3s forwards;
}

.animate-text-delay-2 {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out 0.6s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateZ(0) translateY(0) rotate(var(--rotate));
  }
  25% {
    transform: translateZ(20px) translateY(-15px) rotate(calc(var(--rotate) + 2deg));
  }
  50% {
    transform: translateZ(5px) translateY(5px) rotate(var(--rotate));
  }
  75% {
    transform: translateZ(15px) translateY(-5px) rotate(calc(var(--rotate) - 2deg));
  }
  100% {
    transform: translateZ(0) translateY(0) rotate(var(--rotate));
  }
}

@keyframes textFloat {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes colorChange {
  0% {
    background: linear-gradient(to right, #ffffff, #a8b8d8);
  }
  25% {
    background: linear-gradient(to right, #ffffff, #8ab4f8);
  }
  50% {
    background: linear-gradient(to right, #ffffff, #c4a8f8);
  }
  75% {
    background: linear-gradient(to right, #ffffff, #f8a8d8);
  }
  100% {
    background: linear-gradient(to right, #ffffff, #a8f8e0);
  }
}

/* Styles pour la section "Prêt pour la révolution du cloud?" */
.cloud-revolution-section {
  background-color: #06173c;
  color: white;
  padding: 100px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.revolution-title {
  font-size: 3.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #ffffff, #a8b8d8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.revolution-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 2.5rem;
  color: #a8b8d8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-start {
  background-color: #4285F4;
  color: white;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 30px;
  border: none;
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.glow-effect {
  box-shadow: 0 0 15px 5px rgba(66, 133, 244, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 15px 5px rgba(66, 133, 244, 0.5);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(66, 133, 244, 0.7);
  }
  100% {
    box-shadow: 0 0 15px 5px rgba(66, 133, 244, 0.5);
  }
}

.btn-start:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px 8px rgba(66, 133, 244, 0.8);
  background-color: #5294ff;
}

/* Animations pour le texte de la section "Prêt pour la révolution du cloud?" déclenchées au scroll */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0s, transform 0s;
}

.animate-on-scroll-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 1.2s ease-out, transform 1.2s ease-out;
  animation: floatText 3s ease-in-out 1.2s infinite;
}

/* Délai pour les éléments successifs */
.revolution-subtitle.animate-on-scroll.animate-on-scroll-visible {
  transition-delay: 0.3s;
  animation-delay: 1.5s;
}

.btn-start.animate-on-scroll.animate-on-scroll-visible {
  transition-delay: 0.6s;
  animation-delay: 1.8s;
}

@keyframes floatText {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Styles pour le footer */
.site-footer {
  background-color: #06173c;
  color: #a8b8d8;
  padding-top: 60px;
  position: relative;
  overflow: hidden;
}

.footer-top {
  padding-bottom: 40px;
}

.footer-heading {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.footer-heading::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, #4285F4, #8ab4f8);
  transition: width 0.3s ease;
}

.footer-heading:hover::after {
  width: 100%;
}

.footer-text {
  line-height: 1.6;
  margin-bottom: 25px;
}

.footer-links, .footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li, .footer-contact li {
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.footer-links li:hover, .footer-contact li:hover {
  transform: translateX(5px);
}

.footer-links a {
  color: #a8b8d8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #ffffff;
  text-decoration: none;
}

.footer-contact li {
  display: flex;
  align-items: center;
}

.footer-contact li i {
  margin-right: 10px;
  color: #4285F4;
}

.footer-bottom {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
  position: relative;
}

/* Animation du texte défilant */
.marquee-container {
  width: 100%;
  overflow: hidden;
  margin-bottom: 15px;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 30s linear infinite;
}

.marquee-content span {
  display: inline-block;
  padding: 0 15px;
  color: #8ab4f8;
}

.separator {
  color: #4285F4;
  margin: 0 5px;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.copyright {
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Animations pour les cartes */
.animate-card {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards, float 15s ease-in-out infinite;
  transform-style: preserve-3d;
}

.animate-delay-1 {
  animation-delay: 0.3s, 0.3s;
}

.animate-delay-2 {
  animation-delay: 0.6s, 0.6s;
}

.animate-delay-3 {
  animation-delay: 0.9s, 0.9s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
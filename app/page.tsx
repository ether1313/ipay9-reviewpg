
import HeroSection from '../components/HeroSection';
import ReviewForm from '../components/ReviewForm';
import PastReviews from '../components/PastReviews';
import SocialMedia from '../components/SocialMedia';
import Authorize from '../components/Authorize';
import Footer from '../components/Footer';
import FloatingParticles from '../components/FloatingParticles';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <HeroSection />
      <ReviewForm />
      <SocialMedia />
      <Authorize/>
      <Footer />
    </main>
  );
}


import Header from "../components/home/Header";
import Hero from "../components/home/Hero";
import CategorySection from "../components/home/CategorySection";
import StorySection from "../components/home/StorySection";
import ServiceSection from "../components/home/ServiceSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";

import "../App.css";

function Home() {
  return (
    <div className="app">
      <Header cartCount={0} />

      <main>
        <Hero />
        <CategorySection />
        <StorySection />
        <ServiceSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;

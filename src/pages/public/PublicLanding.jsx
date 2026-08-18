import React from 'react';
import { Header } from '../../components/public/header';
import { Hero } from '../../components/public/hero';
import { Properties } from '../../components/public/properties';
import { Services } from '../../components/public/services';
import { About } from '../../components/public/about';
import { Testimonials } from '../../components/public/testimonials';
import { Contact } from '../../components/public/contact';
import { Footer } from '../../components/public/footer';

export function PublicLanding() {
  return (
    <div className="theme-public dark min-h-screen bg-background text-foreground font-sans selection:bg-[#C7A15E]/30 selection:text-white">
        <Header />
        <main>
          <Hero />
          <Properties />
          <Services />
          <About />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
      </div>
  );
}

export default PublicLanding;

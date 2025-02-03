import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { OffersSlider } from '../components/OffersSlider'
import { PropertySlider } from '../components/PropertySlider'
import { PartnersSlider } from '../components/PartnersSlider'
import { Stats } from '../components/Stats'
import { Footer } from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <OffersSlider />
        <PropertySlider />
        <Stats />
        <PartnersSlider />
      </main>
      <Footer />
    </div>
  )
}


import { SearchResults } from '@/components/SearchResults'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SearchResults />
      <Footer />
    </div>
  )
}


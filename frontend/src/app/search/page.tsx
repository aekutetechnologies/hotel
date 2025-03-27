'use client'

import { SearchResults } from '@/components/SearchResults'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'

export default function SearchPage() {
  return (
    <>
      <Header />
      <motion.main 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <SearchResults />
        </motion.div>
      </motion.main>
      <Footer sectionType="hotels" />
    </>
  )
}


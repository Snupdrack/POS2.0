'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FOOTER = `© 2026 Nito's Pizza. Todos los derechos reservados. Hecho con amor en Oaxaca, México. Diseño y Software por SynkData`

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-nunito">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-28 h-28 mx-auto rounded-full bg-[#E31E24] flex items-center justify-center shadow-lg shadow-red-200 mb-4">
              <span className="text-5xl">🍕</span>
            </div>
            <h1 className="font-bebas text-5xl md:text-7xl text-[#111111] tracking-wide">
              NITO&apos;S PIZZA
            </h1>
            <p className="text-[#E31E24] font-bebas text-xl tracking-wider mt-1">
              PIZZA ARTESANAL EN OAXACA
            </p>
          </motion.div>

          {/* Promo Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#F5A623] text-white py-2 px-6 rounded-full inline-block mb-10 font-bold text-sm"
          >
            🎉 2x1 Martes y Jueves
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/menu" className="block">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF8F0] flex items-center justify-center mb-4 group-hover:bg-[#E31E24] transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                  </div>
                  <h2 className="font-bebas text-2xl text-[#111111] mb-2">MENÚ DIGITAL</h2>
                  <p className="text-gray-500 text-sm">Explora nuestro menú y haz tu pedido</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/login" className="block">
                <div className="bg-[#E31E24] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">💻</span>
                  </div>
                  <h2 className="font-bebas text-2xl text-white mb-2">SISTEMA POS</h2>
                  <p className="text-white/70 text-sm">Acceso para personal del restaurante</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Business Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center space-y-2"
          >
            <p className="text-gray-600 text-sm">📍 Carretera Cristóbal Colón km 30.1, Tlacolula de Matamoros, Oaxaca</p>
            <p className="text-gray-600 text-sm">📞 (951) 725-0827 &nbsp;|&nbsp; 📱 +52 1 951 461 8850</p>
            <p className="text-gray-600 text-sm">🕐 Lunes – Domingo 12:00 PM – 10:00 PM</p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {FOOTER} (<a href="https://synkdata.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">synkdata.online</a>)
        </p>
      </footer>
    </div>
  )
}

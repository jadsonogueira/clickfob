"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ClickFob
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#services"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Services
            </Link>
            <Link
              href="/manage"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Manage Booking
            </Link>
            <Link
              href="/book"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Book Now
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3">
              <Link
                href="/#services"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/manage"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Booking
              </Link>
              <Link
                href="/book"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

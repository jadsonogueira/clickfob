import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">ClickFob</h3>
            <p className="text-gray-400 text-sm">
              Professional on-site fob copying and garage remote service serving all GTA.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/14167707036"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle size={18} />
                <span>+1 (416) 770-7036</span>
              </a>
              <a
                href="mailto:clickfob@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Mail size={18} />
                <span>clickfob@gmail.com</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link
                href="/book"
                className="block text-gray-400 hover:text-blue-400 transition-colors"
              >
                Book a Service
              </Link>
              <Link
                href="/manage"
                className="block text-gray-400 hover:text-blue-400 transition-colors"
              >
                Manage Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ClickFob. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Zap, Shield, MapPin, DollarSign, ArrowRight, Key, Radio, Settings } from "lucide-react";

const services = [
  {
    id: "fob-lf",
    name: "Fob Low Frequency (LF)",
    price: 35,
    description: "Copy your low frequency (125kHz) key fob. Common for older apartment and condo buildings.",
    icon: Key,
  },
  {
    id: "fob-hf",
    name: "Fob High Frequency (HF)",
    price: 60,
    description: "Copy your high frequency (13.56MHz) key fob. Common for newer secure buildings and offices.",
    icon: Radio,
  },
  {
    id: "garage-remote",
    name: "Garage Remote",
    price: 80,
    description: "Program a new garage door remote to work with your existing opener. Fast and reliable.",
    icon: Settings,
  },
];

const valueProps = [
  {
    icon: Zap,
    title: "Fast Service",
    description: "Based on availability",
  },
  {
    icon: Shield,
    title: "Working Guarantee",
    description: "We ensure it works",
  },
  {
    icon: MapPin,
    title: "Serving all GTA",
    description: "Greater Toronto Area",
  },
  {
    icon: DollarSign,
    title: "Fixed Price",
    description: "No Hidden Fees",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              On-Site Fob Copying &<br />
              <span className="text-blue-300">Garage Remote Service</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Professional, fast, and reliable service across the Greater Toronto Area.
              We come to you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Book Now <ArrowRight size={20} />
              </Link>
              <a
                href="https://wa.me/14167707036"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-3">
                  <prop.icon size={28} />
                </div>
                <h3 className="font-bold text-gray-900">{prop.title}</h3>
                <p className="text-sm text-gray-500">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional fob copying and garage remote programming with transparent pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 lg:p-8 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <service.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">${service.price}.00</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 flex-1">{service.description}</p>
                <Link
                  href={`/book?service=${service.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2"
                >
                  Book Now <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Your Fob Copied?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Book your appointment today and we'll come to you!
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

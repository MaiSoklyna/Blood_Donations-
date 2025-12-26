import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🩸</span>
              <span className="font-bold text-xl">BloodConnect</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Connecting blood donors with those in need across Cambodia.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/hospitals" className="text-gray-400 hover:text-white text-sm">Find Hospitals</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white text-sm">Donation Events</Link></li>
              <li><Link href="/blood-market" className="text-gray-400 hover:text-white text-sm">Blood Market</Link></li>
              <li><Link href="/tips" className="text-gray-400 hover:text-white text-sm">Donation Tips</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📍 Phnom Penh, Cambodia</li>
              <li>📞 +855 23 123 456</li>
              <li>✉️ info@bloodconnect.kh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BloodConnect Cambodia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
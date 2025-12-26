import Link from 'next/link';
import Header from './../components/layout/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Save Lives, Donate Blood
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of donors across Cambodia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/hospitals" 
              className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-lg"
            >
              Donate Now
            </Link>
            <Link 
              href="/events" 
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium text-lg"
            >
              Find Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-red-600">5,000+</p>
            <p className="text-gray-600">Donors</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-red-600">12,000</p>
            <p className="text-gray-600">Donations</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-red-600">25</p>
            <p className="text-gray-600">Hospitals</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-red-600">18</p>
            <p className="text-gray-600">Events</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-gray-600">Create your account and complete your donor profile</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Location</h3>
              <p className="text-gray-600">Find a hospital or blood donation event near you</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Lives</h3>
              <p className="text-gray-600">Donate blood and help save up to 3 lives</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-red-100 mb-8">Join our community of heroes today</p>
          <Link 
            href="/login" 
            className="inline-block px-8 py-4 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🩸</span>
              <span className="font-bold text-xl">BloodConnect</span>
            </div>
            <p className="text-gray-400">
              Connecting blood donors with those in need across Cambodia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-gray-400">
              <Link href="/hospitals" className="hover:text-white">Hospitals</Link>
              <Link href="/events" className="hover:text-white">Events</Link>
              <Link href="/blood-market" className="hover:text-white">Blood Market</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="flex flex-col gap-2 text-gray-400">
              <Link href="/tips" className="hover:text-white">Donation Tips</Link>
              <Link href="/about" className="hover:text-white">About Us</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="text-gray-400">
              <p>Phnom Penh, Cambodia</p>
              <p>info@bloodconnect.kh</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 BloodConnect Cambodia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
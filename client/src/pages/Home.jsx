import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
          Find Your Perfect Tutor
        </h1>
        <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
          Connect with verified expert tutors across all subjects. Book a session in minutes.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-black font-semibold px-8 py-3 rounded-xl transition"
        >
          <Search size={20} /> Search Tutors
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { icon: <Search size={32} className="text-primary" />, title: 'Smart Search', desc: 'Filter by subject, location, and price to find the right match.' },
          { icon: <Shield size={32} className="text-primary" />, title: 'Verified Tutors', desc: 'Every tutor is reviewed and approved by our admin team.' },
          { icon: <Star size={32} className="text-accent fill-accent" />, title: 'Honest Reviews', desc: 'Read real reviews from students after completed sessions.' },
        ].map((f) => (
          <div key={f.title} className="bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-800 text-center space-y-3">
            <div className="flex justify-center">{f.icon}</div>
            <h3 className="font-semibold text-navy">{f.title}</h3>
            <p className="text-zinc-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-primary-light rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold text-navy mb-2">Are you a tutor?</h2>
        <p className="text-zinc-400 mb-6">Join our platform and start earning by sharing your expertise.</p>
        <Link
          to="/register"
          className="inline-block bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-xl transition"
        >
          Register as a Tutor
        </Link>
      </div>
    </div>
  );
}

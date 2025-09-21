'use client';

import { useState } from 'react';
import { MessageSquare, X, MessagesSquare } from 'lucide-react';

export default function WhatsApp() {
  // phone without plus: country + number (used by wa.me)
  const waPhone = '917400455087';
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState('Male');
  const [property, setProperty] = useState('Hostel');

  const toggle = () => setOpen(v => !v);

  const startChat = () => {
    const msg = `Hi, I am a ${gender} and I am looking for a ${property}. Can you help me?`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        {/* Chat panel */}
        {open && (
          <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4" style={{ background: 'linear-gradient(180deg,#7A1633,#A31C44)' }}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-full">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold">Start chat</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-white">
              <label className="text-sm text-gray-700">I am</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full mt-2 mb-3 border rounded px-3 py-2">
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>

              <label className="text-sm text-gray-700">I am looking for</label>
              <select value={property} onChange={e => setProperty(e.target.value)} className="w-full mt-2 mb-4 border rounded px-3 py-2">
                <option>Hostel</option>
                <option>Hotel</option>
              </select>

              <button onClick={(e) => { e.stopPropagation(); startChat(); }} className="w-full py-2 rounded text-white" style={{ background: '#7A1633' }}>
                Start Chat
              </button>
            </div>
          </div>
        )}

        {/* Floating button */}
        <button onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label="Open WhatsApp chat" className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none" style={{ background: '#7A1633' }}>
          <MessagesSquare className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
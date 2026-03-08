"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, Sparkles, User, MessageSquare } from "lucide-react";

const API = "http://localhost:5001/api";

export default function Home() {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState<number | null>(null);
  const [data, setData] = useState({ firstName: "", lastName: "", feedback: "" });
  const [busy, setBusy] = useState(false);

  const apiCall = async (endpoint: string, payload: any) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  const handleNext = async () => {
    if (!data.firstName || !data.lastName) return;
    const res = await apiCall('/partial', { first_name: data.firstName, last_name: data.lastName });
    if (res?.id) { setSession(res.id); setStep(2); }
  };

  const handleSubmit = async () => {
    if (!data.feedback || !session) return;
    await apiCall('/complete', { id: session, feedback_text: data.feedback });
    setStep(3);
  };

  const handleReset = () => {
    setSession(null);
    setData({ firstName: "", lastName: "", feedback: "" });
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_#064e3b_0%,_transparent_60%)] opacity-50 pointer-events-none" />

      {/* Progress Dots 1, 2, 3*/}
      <div className="flex gap-4 mb-12 z-10">
        {[1, 2, 3].map(n => (
          <div key={n} className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= n ? 'bg-emerald-500 scale-125' : 'bg-white/20'}`} />
        ))}
      </div>

      <div className="w-full max-w-sm relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">

          {/* Step 1: Enter your name */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <User className="mx-auto text-emerald-400 mb-2" size={32} />
                <h2 className="text-3xl text-white font-light tracking-tight">Welcome.</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text" placeholder="First Name" value={data.firstName}
                  onChange={(e) => setData({ ...data, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
                <input
                  type="text" placeholder="Last Name" value={data.lastName}
                  onChange={(e) => setData({ ...data, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>
              <button onClick={handleNext} disabled={busy || !data.firstName || !data.lastName} className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl flex justify-center items-center gap-2">
                {busy ? "Saving..." : "Continue"} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Enter your feedback */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <MessageSquare className="mx-auto text-emerald-400 mb-2" size={32} />
                <h2 className="text-3xl text-white font-light tracking-tight">Your Thoughts</h2>
              </div>
              <textarea
                placeholder="What's on your mind?" value={data.feedback} onChange={(e) => setData({ ...data, feedback: e.target.value })}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition resize-none"
              />
              <button onClick={handleSubmit} disabled={busy || !data.feedback} className="w-full py-4 mt-2 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl flex justify-center items-center gap-2">
                {busy ? "Submitting..." : "Submit"} <Sparkles size={18} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Thank you */}
          {step === 3 && (
            <motion.div key="s3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center gap-6 py-8">
              <div className="space-y-2">
                <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-2" />
                <h2 className="text-3xl text-white font-light">Done.</h2>
                <p className="text-white/50">Your feedback is saved securely.</p>
              </div>
              <button onClick={handleReset} className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition">
                Submit Another Response
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

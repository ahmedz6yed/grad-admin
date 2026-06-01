import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Hourglass, 
  Download, 
  Smartphone, 
  Clock, 
  ShieldAlert, 
  ChevronDown, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

const faqs = [
  {
    question: "How long does the admin approval process take?",
    answer: "The approval process varies depending on the current volume of requests and the verification required. There is no guaranteed timeframe, but rest assured our team is processing applications as quickly as possible."
  },
  {
    question: "Can I use the app while I wait?",
    answer: "Absolutely! You have full access to the standard user features. We encourage you to download the mobile application and start exploring the platform right away."
  },
  {
    question: "Will I be notified when my status changes?",
    answer: "Yes, once an administrator reviews your account and grants administrative privileges, you will receive an email notification detailing your new access rights."
  },
  {
    question: "What if I no longer want to be an admin?",
    answer: "If you change your mind, you can simply continue using the app as a standard user. There are no obligations tied to the pending administrative request."
  }
];

export default function Waiting() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-page text-charcoal font-sans selection:bg-sage/30 selection:text-sage-dark overflow-hidden relative flex flex-col">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sage-light/20 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cream-dim/60 blur-[150px] rounded-full mix-blend-overlay" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-border/30 blur-[100px] rounded-full mix-blend-multiply" />
        {/* Grain overlay for editorial texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center max-w-4xl">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full mb-16"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-20 h-20 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-sage/10 rounded-full blur-xl animate-pulse" />
            <div className="w-full h-full border border-sage/20 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg relative z-10 overflow-hidden group">
              <motion.div 
                animate={{ rotate: 180 }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
              >
                <Hourglass className="w-8 h-8 text-sage" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block py-1 px-4 rounded-full border border-border/60 bg-surface/40 backdrop-blur-sm text-xs font-bold uppercase tracking-[0.2em] text-text-subtle mb-6">
              Status: Standard User
            </span>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-charcoal tracking-tight leading-[1.1]">
              Patience is a <br className="hidden md:block" />
              <span className="text-sage italic">virtue.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
              You currently have standard user access. Your request for administrative privileges is in our queue and will be reviewed in due time.
            </p>
          </motion.div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-3xl border border-border/40 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(125,140,90,0.08)] hover:border-sage/30 hover:bg-white/60"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Smartphone className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-sage/10 text-sage flex items-center justify-center mb-6">
                <Download className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-charcoal">Use the App</h3>
              <p className="text-text-muted mb-8 leading-relaxed flex-grow">
                While you wait, you are fully authorized to download and use the application as a standard user. All core features are available to you immediately.
              </p>
              
              <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal group-hover:text-sage transition-colors w-fit">
                Download Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-3xl border border-border/40 bg-surface-raised/30 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldAlert className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-charcoal/5 text-charcoal/60 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-charcoal">Admin Access</h3>
              <p className="text-text-muted mb-6 leading-relaxed flex-grow">
                Upgrading to an administrative role requires manual verification. There is no set timeline for this process. We appreciate your patience while our team reviews your profile.
              </p>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-text-subtle uppercase tracking-widest bg-white/40 w-fit px-4 py-2 rounded-full border border-border/30">
                <Hourglass className="w-3.5 h-3.5 animate-pulse" /> Pending Review
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQs Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Frequently Asked Questions</h2>
            <div className="w-12 h-[1px] bg-sage mx-auto" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={false}
                className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${openFaq === idx ? 'border-sage/30 bg-white/60 shadow-[0_4px_20px_rgb(125,140,90,0.05)]' : 'border-border/40 bg-white/30 hover:bg-white/50 hover:border-border/60'}`}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-medium text-charcoal pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-sage/10 text-sage' : 'bg-surface text-text-subtle'}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 pt-0 text-text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
import { motion } from "motion/react";
import { Container } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

const fadeIn = {

  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ApexRed() {
  const navigate = useNavigate();
  const { session } = useSession();

  const handleCta = () => {
    navigate(session ? "/app" : "/auth");
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-full uppercase tracking-[0.1em] shadow-sm">
              <Container size={14} className="stroke-[3]" />
              Coming Soon — Beta
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95]">
            ENHANCE YOUR ENTIRE <br />
            <span className="text-red-600">WORKFLOW LOGISTICS</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
            Apex Red brings your shipments, warehouses, inventory, and prep centers together into one streamlined logistics command center.
          </p>
          <button
            onClick={handleCta}
            className="bg-red-600 text-white px-10 py-4 rounded-[20px] font-black hover:bg-red-700 hover:scale-105 transition-all text-lg shadow-2xl uppercase tracking-wide"
          >
            Sign Up for Beta
          </button>
        </motion.div>

        {/* Footer CTA (matches other Apex color pages) */}
        <div className="mt-32 p-12 lg:p-16 bg-red-600 rounded-[56px] text-white relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="text-red-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">The next suite is on its way.</div>
            <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">
              Enhance Your Entire Workflow Logistics
            </h2>
            <p className="text-lg lg:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Be first in line when Apex Red goes live.
            </p>
            <button
              onClick={handleCta}
              className="bg-white text-red-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl"
            >
              Sign Up for Beta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

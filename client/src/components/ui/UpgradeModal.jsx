import { useState } from "react";
import { Check, ShieldAlert, Sparkles, CreditCard, Loader2 } from "lucide-react";
import { resetUsageDev } from "../../services/usageService";
import { useAuth } from "../../hooks/useAuth";

export default function UpgradeModal({ isOpen, onClose }) {
  const { setUsage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Mock validation
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        throw new Error("Please fill in all credit card details.");
      }

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call developer reset API to reset credits to full configuration
      try {
        const response = await resetUsageDev();
        if (response.data) {
          setUsage(response.data);
        }
      } catch (apiError) {
        console.warn("Dev usage reset route failed/production mode. Resetting locally.", apiError);
        // Fallback: update state locally if API is not accessible/production
        setUsage((current) => {
          if (!current) return null;
          return {
            ...current,
            aiCredits: current.maxAiCredits,
            documentCredits: current.maxDocumentCredits,
            pdfUploadsToday: 0,
            pictureUploadsToday: 0,
            videoUploadsToday: 0,
          };
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsLoading(false);
        onClose();
        // Clear fields
        setCardName("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Payment processing failed. Please check card info.");
      setIsLoading(false);
    }
  };

  const autofillMockCard = () => {
    setCardName("John Doe");
    setCardNumber("4111 2222 3333 4444");
    setCardExpiry("12/29");
    setCardCvc("123");
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur-md animate-[fade-in_180ms_ease-out]">
      <div className="relative w-full max-w-xl rounded-[32px] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden md:p-8">
        
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-teal-500/10 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 -z-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-[scale-up_200ms_ease-out]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-zinc-100">Upgrade Successful!</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Welcome to Premium! Your credits have been fully recharged.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
                  <Sparkles className="h-3 w-3" />
                  Premium Plan
                </span>
                <h3 className="mt-3 text-2xl font-bold text-zinc-100">Upgrade to SomuPilot Premium</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Unleash unlimited power and say goodbye to rate limits.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/5 p-1 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Split Content */}
            <div className="mt-6 grid gap-6 md:grid-cols-12">
              {/* Features List */}
              <div className="space-y-4 md:col-span-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">$9.99</span>
                  <span className="text-sm font-medium text-zinc-400">/ month</span>
                </div>
                <p className="text-xs text-zinc-500">Cancel or switch plans anytime.</p>
                
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 stroke-[3]" />
                    <span>Unlimited AI Chats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 stroke-[3]" />
                    <span>Access Premium Models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 stroke-[3]" />
                    <span>Priority Speed & Response</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 stroke-[3]" />
                    <span>100x Document Uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-400 shrink-0 stroke-[3]" />
                    <span>Priority 24/7 Support</span>
                  </li>
                </ul>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleUpgrade} className="space-y-3.5 md:col-span-7">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    Mock Payment details
                  </span>
                  <button
                    type="button"
                    onClick={autofillMockCard}
                    className="text-[10px] font-semibold text-teal-400 hover:text-teal-300 transition"
                  >
                    Autofill Test Card
                  </button>
                </div>

                {error ? (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. John Doe"
                    disabled={isLoading}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-teal-500/50 focus:bg-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4111 2222 3333 4444"
                    disabled={isLoading}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-teal-500/50 focus:bg-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Expiration</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      disabled={isLoading}
                      maxLength={5}
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-teal-500/50 focus:bg-zinc-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wide">CVC</label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••"
                      disabled={isLoading}
                      className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-teal-500/50 focus:bg-zinc-900 text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 py-2.5 text-xs font-bold text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing payment...
                    </>
                  ) : (
                    "Upgrade Plan"
                  )}
                </button>

                <p className="text-[9px] text-center text-zinc-500 leading-normal">
                  Secure checkout powered by Stripe Mock Engine. Your actual credit card is not charged.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

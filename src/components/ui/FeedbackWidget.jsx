import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("IDLE"); // IDLE, SUBMITTING, SUCCESS, ERROR

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    // Add page context so you know where they submitted this from
    data.append("source", window.location.pathname);

    try {
      setStatus("SUBMITTING");
      const response = await fetch("https://formspree.io/f/mykvgnrb", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        setStatus("SUCCESS");
        // Auto-close after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setStatus("IDLE");
        }, 3000);
      } else {
        setStatus("ERROR");
      }
    } catch (err) {
      setStatus("ERROR");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print-hide">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-accent flex items-center justify-center !rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ width: "56px", height: "56px", padding: 0 }}
          aria-label="Give Feedback"
        >
          <MessageSquare size={24} fill="currentColor" />
        </button>
      )}

      {/* Expanded Panel */}
      {isOpen && (
        <div 
          className="w-80 overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", animation: "fade-in 0.2s ease-out forwards" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <h3 className="font-semibold text-[14px]" style={{ color: "var(--text)" }}>Brutal Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-2)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4">
            {status === "SUCCESS" ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 size={36} className="text-green-500 mb-3" />
                <h4 className="font-semibold" style={{ color: "var(--text)" }}>Message sent.</h4>
                <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Thanks for keeping us sharp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Found a bug? Hate a feature? Tell us right now.</p>
                <textarea
                  name="feedback"
                  required
                  rows={4}
                  placeholder="What's broken or annoying?"
                  className="w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                ></textarea>
                <input 
                  type="email"
                  name="email"
                  placeholder="Your email (optional)"
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
                <button
                  type="submit"
                  disabled={status === "SUBMITTING"}
                  className="btn btn-accent mt-1 flex w-full items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed py-2"
                >
                  {status === "SUBMITTING" ? "Sending..." : "Send it"}
                  {status !== "SUBMITTING" && <Send size={14} />}
                </button>
                {status === "ERROR" && (
                  <p className="text-xs text-red-500 text-center">Something went wrong. Try again.</p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

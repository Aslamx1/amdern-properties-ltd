/* AI Assistant — Amdern Properties SMC LTD
   Production-ready Real Estate AI Chatbot */
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Send,
  RotateCcw,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Calendar,
  CreditCard,
  Search,
  Sparkles,
} from "lucide-react";
import { SITE, getMailtoLink, getWhatsAppLink } from "@/lib/site";
import {
  type Listing,
  type Filters,
  filterListings,
  formatUGX,
  formatPrice,
  LISTINGS,
} from "@/lib/listings";
import { generateAssistantResponse, type AiAssistantResponse } from "@/lib/ai-property-engine";
import { useCurrency, formatWithCurrency } from "@/hooks/use-currency";

type Sender = "user" | "assistant";
type LeadStep = "idle" | "name" | "phone" | "email" | "review" | "done";

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  properties?: Listing[];
  isStreaming?: boolean;
  quickActions?: QuickAction[];
  followUpChips?: QuickAction[];
  leadForm?: boolean;
};

type QuickAction = {
  id: string;
  label: string;
  icon: "search" | "calendar" | "agent" | "pricing" | "general";
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: "rent-kampala", label: "Find apartments for rent in Kampala", icon: "search" },
  { id: "viewing", label: "Schedule a property viewing", icon: "calendar" },
  { id: "agent", label: "Contact a verified agent", icon: "agent" },
  { id: "pricing", label: "Get pricing & payment options", icon: "pricing" },
];

const QUICK_ACTION_ICON: Record<QuickAction["icon"], typeof Search> = {
  search: Search,
  calendar: Calendar,
  agent: User,
  pricing: CreditCard,
  general: Sparkles,
};

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AiAssistantWidget() {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep>("idle");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with welcome
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      setMessages([
        {
          id: makeId("welcome"),
          sender: "assistant",
          text:
            "Hello and welcome to **AMDERN Properties SMC LTD**! 👋\n\n" +
            "I'm your dedicated property consultant. I can help you find houses, apartments, land, commercial properties, or cars — and connect you with verified agents.\n\n" +
            "What kind of property are you looking for today?",
          timestamp: nowStamp(),
          quickActions: QUICK_ACTIONS,
        },
      ]);
    }
  }, [open, hasOpened]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  const resizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  // Parse user query into a property search
  const buildSearch = useCallback((query: string): { filters: Filters; summary: string } | null => {
    const q = query.toLowerCase();
    const filters: Filters = {};
    const parts: string[] = [];

    if (/(rent|rental|to let|leasing)/.test(q)) {
      filters.listing = "rent";
      parts.push("rentals");
    } else if (/(sale|buy|purchase|for sale)/.test(q)) {
      filters.listing = "sale";
      parts.push("for sale");
    }

    if (/(apartment|flat|condo|studio)/.test(q)) {
      filters.category = "flats";
      parts.push("apartments");
    } else if (/(house|home|villa|bungalow|townhouse)/.test(q)) {
      filters.category = "houses";
      parts.push("houses");
    } else if (/(land|plot)/.test(q)) {
      filters.category = "land";
      parts.push("land");
    } else if (/(commercial|office|shop|warehouse)/.test(q)) {
      filters.category = "commercial";
      parts.push("commercial");
    } else if (/(car|vehicle)/.test(q)) {
      filters.category = "vehicles";
      parts.push("vehicles");
    }

    const locMatch = q.match(/(?:in|at|near|around)\s+([a-z][a-z\s-]{2,30})/);
    if (locMatch && locMatch[1]) {
      const loc = locMatch[1].trim().split(/\s+/).slice(0, 3).join(" ");
      filters.location = loc;
      parts.push(`in ${loc}`);
    }

    const bedsMatch = q.match(/(\d+)\s*(?:bed|bedroom|br|bedrm)/);
    if (bedsMatch && bedsMatch[1]) {
      const beds = parseInt(bedsMatch[1], 10);
      filters.beds = beds;
      parts.push(`${beds}-bed`);
    }

    const priceMatch = q.match(/(?:under|below|less than|max)\s*(?:ugx\s*)?([\d,]+)/);
    if (priceMatch && priceMatch[1]) {
      const v = parseInt(priceMatch[1].replace(/,/g, ""), 10);
      if (!Number.isNaN(v)) {
        filters.max = v;
        parts.push(`under ${formatWithCurrency(v, currency.code)}`);
      }
    }

    if (parts.length === 0) return null;
    return { filters, summary: parts.join(" ") };
  }, []);

  const searchProperties = useCallback(
    (query: string): Listing[] => {
      const parsed = buildSearch(query);
      const filters: Filters = parsed?.filters ?? {};
      const out = filterListings(filters);
      return out.slice(0, 6);
    },
    [buildSearch],
  );

  // Stream AI response with a typing effect
  const streamResponse = useCallback((fullText: string, properties: Listing[] | undefined) => {
    setIsTyping(true);
    const id = makeId("a");
    const stamp = nowStamp();

    // Add an empty assistant message that we'll fill
    setMessages((prev) => {
      const next: ChatMessage = {
        id,
        sender: "assistant",
        text: "",
        timestamp: stamp,
        properties: properties ?? [],
        isStreaming: true,
      };
      return [...prev, next];
    });

    let i = 0;
    const step = 12; // characters per tick
    const interval = setInterval(() => {
      i += step;
      const slice = fullText.slice(0, i);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: slice } : m)));
      if (i >= fullText.length) {
        clearInterval(interval);
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
        setIsTyping(false);
      }
    }, 30);
  }, []);

  const processQuery = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();

      // Push user message
      setMessages((prev) => {
        const next: ChatMessage = {
          id: makeId("u"),
          sender: "user",
          text: trimmed,
          timestamp: nowStamp(),
        };
        return [...prev, next];
      });
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      // Detect lead-capture intents
      if (
        /(speak|talk|contact|call|reach).*(agent|realtor|broker|someone|human|representative)/.test(
          lower,
        ) ||
        /view.*(property|home|apartment|house).*(in person|physically)/.test(lower) ||
        /(schedule|book|arrange|set up).*(viewing|tour|visit|showing|appointment)/.test(lower)
      ) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setLeadStep("name");
          setMessages((prev) => {
            const next: ChatMessage = {
              id: makeId("a"),
              sender: "assistant",
              text: "Great! I would love to connect you with one of our verified AMDERN agents. They will reach out within the hour to help.\n\nBefore I do, could you share a few quick details so we can match you with the right agent?",
              timestamp: nowStamp(),
              leadForm: true,
            };
            return [...prev, next];
          });
        }, 600);
        return;
      }

      // Handle "Get pricing & payment options" intent
      if (/pricing|payment|price|cost|how much|afford|finance|mortgage|installment/.test(lower)) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const featured = LISTINGS.filter((l) => l.listing === "sale").slice(0, 3);
          const responseText =
            "Here is how pricing and payment works at AMDERN PROPERTIES SMC LTD:\n\n" +
            "**1. Pricing**\n" +
            "• Houses for sale: UGX 250M – UGX 2.5B\n" +
            "• Apartments: UGX 80M – UGX 900M\n" +
            "• Land (per decimal): UGX 8M – UGX 45M\n" +
            "• Commercial: UGX 350M – UGX 4B\n\n" +
            "**2. Payment options**\n" +
            "• Outright cash purchase (with 5% discount)\n" +
            "• Bank mortgage (we work with all major Ugandan banks)\n" +
            "• Installments over 6–24 months (developer-backed)\n" +
            "• Rent-to-own on selected properties\n\n" +
            "Would you like me to show you a few sample properties you can afford, or connect you with a financing partner?";
          const next: ChatMessage = {
            id: makeId("a"),
            sender: "assistant",
            text: responseText,
            timestamp: nowStamp(),
            properties: featured,
            followUpChips: [
              { id: "show-affordable", label: "Show me affordable options", icon: "search" },
              { id: "financing", label: "Connect with financing", icon: "agent" },
            ],
          };
          setMessages((prev) => [...prev, next]);
        }, 700);
        return;
      }

      // Property search with intelligent understanding
      const parsed = buildSearch(trimmed);
      let results: Listing[] = [];
      let summary = parsed?.summary ?? "";

      if (parsed) {
        results = searchProperties(trimmed);
        if (results.length === 0) {
          // Try a relaxed search
          const relaxed: Filters = { ...parsed.filters };
          delete relaxed.beds;
          delete relaxed.max;
          results = filterListings(relaxed).slice(0, 6);
          if (results.length > 0) {
            summary = `properties that loosely match (${
              parsed.summary
                .replace(/^\d+-bed\s*/, "")
                .replace(/under\s*[\d,]+\s*ugx\s*/i, "")
                .trim() || "your criteria"
            })`;
          }
        }
      } else {
        // Try keyword-based search (e.g. "Naalya houses", "land in Kira")
        const anyListing = filterListings({ q: trimmed });
        if (anyListing.length > 0) {
          results = anyListing.slice(0, 6);
          summary = "properties matching your search";
        }
      }

      if (results.length > 0) {
        const intro = summary
          ? `I found ${results.length} ${summary} for you. Tap any card to see full details, photos, and contact the agent:`
          : `Here are some properties that might interest you. Tap any to see full details, photos, and contact the agent:`;
        streamResponse(intro, results);
        return;
      }

      // Fall back to AI engine for general conversation
      let response: AiAssistantResponse;
      try {
        response = generateAssistantResponse(trimmed, "UGX");
      } catch {
        response = { text: "" };
      }

      if (response.text) {
        streamResponse(response.text, response.properties);
        return;
      }

      // Truly don't know — ask a clarifying question (human-like)
      streamResponse(
        "I want to make sure I get this right for you. Could you tell me a bit more? For example:\n\n" +
          "• What type of property (house, apartment, land, commercial)?\n" +
          "• Where would you like it (Kampala, Wakiso, Kira, etc.)?\n" +
          "• Is this to buy, rent, or short-let?\n" +
          "• Any budget in mind?",
        undefined,
      );
    },
    [searchProperties, buildSearch, streamResponse],
  );

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      processQuery(action.label);
    },
    [processQuery],
  );

  const reset = () => {
    setMessages([
      {
        id: makeId("welcome"),
        sender: "assistant",
        text: "Hello again! 👋 I'm your AMDERN Properties assistant. How can I help you today?",
        timestamp: nowStamp(),
        quickActions: QUICK_ACTIONS,
      },
    ]);
    setLeadStep("idle");
    setLeadName("");
    setLeadPhone("");
    setLeadEmail("");
  };

  const submitLead = () => {
    if (leadStep === "name" && leadName.trim()) {
      setLeadStep("phone");
    } else if (leadStep === "phone" && leadPhone.trim()) {
      setLeadStep("email");
    } else if (leadStep === "email" && leadEmail.trim()) {
      setLeadStep("review");
    } else if (leadStep === "review") {
      setLeadStep("done");
      setMessages((prev) => {
        const next: ChatMessage = {
          id: makeId("a"),
          sender: "assistant",
          text:
            `✅ Perfect! I've passed your details to our team:\n\n` +
            `• Name: ${leadName}\n` +
            `• Phone: ${leadPhone}\n` +
            `• Email: ${leadEmail}\n\n` +
            `An AMDERN agent will reach out within 1 hour. You can also reach us directly:`,
          timestamp: nowStamp(),
        };
        return [...prev, next];
      });
      const mailto = getMailtoLink(
        `[AMDERN AI Lead] ${leadName}`,
        `Name: ${leadName}\nPhone: ${leadPhone}\nEmail: ${leadEmail}\n\nCaptured via Amdern AI Assistant`,
      );
      window.location.href = mailto;
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isTyping) processQuery(input);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AMDERN Properties AI Assistant"
          className="fixed bottom-[calc(4.75rem+max(0.5rem,env(safe-area-inset-bottom)))] right-3 sm:bottom-20 sm:right-4 z-50 flex w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          style={{ height: "min(560px, calc(100vh - 7.5rem))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-gradient-to-r from-primary to-red-700 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <img
                  src="/adn-logo-white.svg"
                  alt="Amdern"
                  className="h-5 w-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/adn-logo.svg";
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold leading-tight">AMDERN Assistant</p>
                <p className="flex items-center gap-1 text-[10px] font-medium opacity-90">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online · Usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={reset}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 hover:bg-white/15"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onQuickAction={handleQuickAction} />
            ))}

            {/* Lead capture inline form */}
            {leadStep !== "idle" && leadStep !== "done" && (
              <LeadForm
                step={leadStep}
                name={leadName}
                phone={leadPhone}
                email={leadEmail}
                onChangeName={setLeadName}
                onChangePhone={setLeadPhone}
                onChangeEmail={setLeadEmail}
                onSubmit={submitLead}
              />
            )}

            {isTyping && messages[messages.length - 1]?.text !== "" && <TypingIndicator />}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  resizeInput();
                }}
                onKeyDown={onKeyDown}
                placeholder="Type your question…"
                rows={1}
                disabled={leadStep !== "idle"}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium overflow-hidden disabled:opacity-50"
              />
              <button
                onClick={() => processQuery(input)}
                disabled={!input.trim() || isTyping || leadStep !== "idle"}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-bold transition-all hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-center text-[9px] text-slate-400">
              AMDERN PROPERTIES SMC LTD · Powered by AMDERN AI
            </p>
          </div>
        </div>
      )}

      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Amdern Assistant" : "Open Amdern Property Assistant"}
        className="fixed bottom-[calc(4.25rem+max(0.5rem,env(safe-area-inset-bottom)))] right-3.5 sm:bottom-6 sm:right-6 z-50 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-red-700 text-white shadow-2xl hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
        </span>
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <img
            src="/adn-logo-white.svg"
            alt="Amdern Assistant"
            className="h-7 w-7 object-contain drop-shadow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/adn-logo.svg";
            }}
          />
        )}
      </button>
    </>
  );
}

function MessageBubble({
  message,
  onQuickAction,
}: {
  message: ChatMessage;
  onQuickAction: (a: QuickAction) => void;
}) {
  const isUser = message.sender === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-xs ${
          isUser
            ? "bg-gradient-to-r from-primary to-red-700 text-white rounded-tr-none"
            : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
        }`}
      >
        <FormattedText text={message.text} isUser={isUser} />
        {message.isStreaming && (
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-current align-middle" />
        )}
        <span
          className={`mt-1 block text-[9px] text-right font-medium ${
            isUser ? "text-white/70" : "text-slate-400"
          }`}
        >
          {message.timestamp}
        </span>
      </div>

      {/* Quick actions */}
      {message.quickActions && !message.isStreaming && (
        <div className="mt-2 flex w-full max-w-[88%] flex-wrap gap-1.5">
          {message.quickActions.map((a) => {
            const Icon = QUICK_ACTION_ICON[a.icon];
            return (
              <button
                key={a.id}
                onClick={() => onQuickAction(a)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors shadow-xs"
              >
                <Icon className="h-3 w-3" />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Follow-up chips */}
      {message.followUpChips && !message.isStreaming && (
        <div className="mt-2 flex w-full max-w-[88%] flex-wrap gap-1.5">
          {message.followUpChips.map((a) => {
            const Icon = QUICK_ACTION_ICON[a.icon];
            return (
              <button
                key={a.id}
                onClick={() => onQuickAction(a)}
                className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100 transition-colors shadow-xs"
              >
                <Icon className="h-3 w-3" />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Property cards with "View all" link */}
      {message.properties && message.properties.length > 0 && !message.isStreaming && (
        <div className="mt-2 grid w-full max-w-[88%] gap-1.5">
          {message.properties.slice(0, 4).map((p) => (
            <PropertyCard key={p.id} listing={p} />
          ))}
          {message.properties.length > 4 && (
            <Link
              to="/for-sale"
              className="mt-1 text-center text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
            >
              View all {message.properties.length} matches →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  if (!text) return null;
  return (
    <div className="whitespace-pre-line break-words">
      {text.split("\n").map((line, li) => (
        <p key={li} className={li > 0 ? "mt-1.5" : ""}>
          {line.split(/(\*\*[^*]+\*\*)/).map((chunk, ci) => {
            if (chunk.startsWith("**") && chunk.endsWith("**")) {
              return (
                <strong
                  key={ci}
                  className={`font-extrabold ${isUser ? "text-white" : "text-slate-900"}`}
                >
                  {chunk.slice(2, -2)}
                </strong>
              );
            }
            return <span key={ci}>{chunk}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-3 py-2.5 shadow-xs w-fit">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
    </div>
  );
}

function PropertyCard({ listing }: { listing: Listing }) {
  const thumb = listing.images?.[0] || "/placeholder.png";
  const { currency } = useCurrency();
  const price = formatWithCurrency(listing.price, currency.code);
  return (
    <Link
      to="/property/$id"
      params={{ id: listing.slug || listing.id }}
      className="group flex items-center gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 hover:border-red-200 hover:shadow-sm transition-all"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <img
          src={thumb}
          alt={listing.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-bold text-slate-900 group-hover:text-red-600">
          {listing.title}
        </p>
        <p className="truncate text-[10px] text-slate-500">
          {listing.area}, {listing.district}
        </p>
        <p className="text-[11px] font-extrabold text-red-600">{price}</p>
      </div>
    </Link>
  );
}

function LeadForm({
  step,
  name,
  phone,
  email,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onSubmit,
}: {
  step: LeadStep;
  name: string;
  phone: string;
  email: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onSubmit: () => void;
}) {
  if (step === "done") {
    return (
      <div className="flex flex-col items-start gap-2 rounded-2xl rounded-tl-none border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="h-4 w-4" />
          Lead captured successfully
        </div>
        <p className="text-emerald-800/80">Our team will contact you shortly.</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <a
            href={getWhatsAppLink(
              SITE.whatsapp,
              `Hello AMDERN, I'm ${name}. I just submitted a request via the assistant.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
          >
            <Phone className="h-3 w-3" /> WhatsApp
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <Phone className="h-3 w-3" /> Call
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 text-[13px] shadow-xs">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {step === "name" && "Your name"}
        {step === "phone" && "Phone / WhatsApp number"}
        {step === "email" && "Email address"}
        {step === "review" && "Confirm your details"}
      </p>

      {step === "name" && (
        <input
          autoFocus
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="e.g. Sarah Nakato"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      )}
      {step === "phone" && (
        <input
          autoFocus
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="+256 7XX XXX XXX"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      )}
      {step === "email" && (
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      )}
      {step === "review" && (
        <div className="space-y-1.5 rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-700">
          <p>
            <span className="font-bold">Name:</span> {name}
          </p>
          <p>
            <span className="font-bold">Phone:</span> {phone}
          </p>
          <p>
            <span className="font-bold">Email:</span> {email}
          </p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={
          (step === "name" && !name.trim()) ||
          (step === "phone" && !phone.trim()) ||
          (step === "email" && !email.trim())
        }
        className="mt-2.5 w-full rounded-lg bg-red-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {step === "review" ? "Confirm & Send" : "Continue"}
      </button>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import districtsData from "@/data/districts.json";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Settings,
  Trash2,
  Copy,
  Check,
  Cpu,
  Globe,
  Satellite,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Key,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendChatMessage, type ChatRequest } from "@/lib/langchain/chat.functions";
import type { ChatMessage, LLMProvider } from "@/lib/langchain/agrishift-agent";

interface ChatInterfaceProps {
  embedded?: boolean;
  defaultDistrictId?: string;
  onClose?: () => void;
}

const STORAGE_KEY_SETTINGS = "agrishift_chat_settings_v1";
const STORAGE_KEY_HISTORY = "agrishift_chat_history_v1";

interface StoredSettings {
  provider: LLMProvider;
  geminiKey: string;
  openaiKey: string;
  modelName: string;
}

export function ChatInterface({
  embedded = false,
  defaultDistrictId = "rajshahi",
  onClose,
}: ChatInterfaceProps) {
  const { lang } = useLang();
  const isBn = lang === "bn";

  const [districtId, setDistrictId] = useState<string>(defaultDistrictId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<StoredSettings>({
    provider: "google",
    geminiKey: (import.meta.env["VITE_GEMINI_API_KEY"] as string) || "",
    openaiKey: "",
    modelName: "gemini-3.8-flash",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved settings & history on mount
  useEffect(() => {
    try {
      const defaultGeminiKey = (import.meta.env["VITE_GEMINI_API_KEY"] as string) || "";
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (!parsed.geminiKey && defaultGeminiKey) {
          parsed.geminiKey = defaultGeminiKey;
          parsed.provider = "google";
        }
        if (parsed.modelName === "gemini-1.5-flash" || !parsed.modelName) {
          parsed.modelName = "gemini-3.8-flash";
        }
        setSettings(parsed);
      } else if (defaultGeminiKey) {
        setSettings({
          provider: "google",
          geminiKey: defaultGeminiKey,
          openaiKey: "",
          modelName: "gemini-3.8-flash",
        });
      }

      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        // Initial welcome message
        const initialGreeting: ChatMessage = {
          id: "welcome-1",
          role: "assistant",
          content: isBn
            ? `স্বাগতম! আমি **AgriShift AI** (ল্যাংচেইন চালিত কৃষি ও নাসা আর্থ অবজারভেশন পরামর্শক)।\n\nআপনি বাংলাদেশ কৃষি, নাসার স্যাটেলাইট উপাত্ত (SMAP, Landsat 9, OpenET), খরা সহনশীল ফসল, সেচ খরচ সাশ্রয় কিংবা ৩-বছরের ফসল পর্যায়ক্রম নিয়ে যেকোনো প্রশ্ন করতে পারেন।\n\nউপরে আপনার জেলা নির্বাচন করুন অথবা নিচের সাজেস্টেড প্রশ্নে ক্লিক করুন!`
            : `Welcome! I am **AgriShift AI** (powered by LangChain with NASA Earth Observation telemetry).\n\nAsk me about climate disaster adaptation in Bangladesh, NASA satellite readings (SMAP soil moisture, Landsat 9 NDVI, OpenET), low-cost crop diversification, or 3-year crop rotations.\n\nSelect your district above or click any suggested prompt below to begin!`,
          timestamp: Date.now(),
        };
        setMessages([initialGreeting]);
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
    }
  }, [isBn]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages.slice(-30)));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSaveSettings = (newSettings: StoredSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
    setSettingsOpen(false);
  };

  const handleClearHistory = () => {
    const confirmClear = window.confirm(
      isBn ? "আপনি কি কথোপকথনের ইতিহাস মুছে ফেলতে চান?" : "Clear all chat messages?",
    );
    if (!confirmClear) return;
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const activeKey =
        settings.provider === "google"
          ? settings.geminiKey
          : settings.provider === "openai"
            ? settings.openaiKey
            : undefined;

      const req: ChatRequest = {
        messages: newHistory,
        provider: settings.provider,
        apiKey: activeKey,
        modelName: settings.modelName,
        districtId,
        lang: isBn ? "bn" : "en",
      };

      const res = await sendChatMessage(req);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Error communicating with AgriShift AI:", error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: isBn
          ? "একটি সমস্যা দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
          : "An error occurred while generating the response. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentDistrict = districtsData.find((d) => d.id === districtId);

  const quickPrompts = isBn
    ? [
        {
          label: "খরায় রাজশাহীতে কোন ফসল চাষ লাভজনক?",
          query:
            "খরা ও পানির ঘাটতি মোকাবেলায় রাজশাহীতে কোন ফসল চাষ করা উচিত এবং সেচ খরচ কত সাশ্রয় হবে?",
        },
        {
          label: "SMAP স্যাটেলাইটের মাটি আর্দ্রতা কীভাবে কাজ করে?",
          query: "নাসার SMAP উপগ্রহের মাটি আর্দ্রতা উপাত্ত কৃষকদের কী কাজে লাগে?",
        },
        {
          label: "খুলনায় লবণাক্ত জমিতে কী চাষ করব?",
          query: "খুলনার উপকূলীয় লবণাক্ত মাটিতে কোন সহনশীল ফসল চাষ করা যায়?",
        },
        {
          label: "৩-বছরের ফসল চক্র ও নাইট্রোজেন ক্রেডিট কী?",
          query: "৩ বছরের অভিযোজিত ফসল পর্যায়ক্রম এবং ডাল ফসলের নাইট্রোজেন ক্রেডিট ব্যাখ্যা করুন।",
        },
      ]
    : [
        {
          label: "Drought crops for Rajshahi?",
          query:
            "Which drought-resilient crops should I plant in Rajshahi to replace Boro rice and save diesel irrigation?",
        },
        {
          label: "How does NASA SMAP help my farm?",
          query:
            "How does NASA SMAP 0-5cm soil moisture data assist in irrigation scheduling and water conservation?",
        },
        {
          label: "Best crops for coastal salinity?",
          query:
            "What are the most profitable salt-tolerant crops for saline soil in Khulna coastal districts?",
        },
        {
          label: "Explain 3-year rotation & N-credit",
          query:
            "Explain how a 3-year Maize -> Mungbean -> Sorghum rotation saves water and provides natural nitrogen credit.",
        },
      ];

  return (
    <div
      className={`flex flex-col bg-[#080d1a] border border-cyan-500/20 shadow-2xl rounded-2xl overflow-hidden font-sans text-slate-200 ${
        embedded ? "h-full w-full" : "h-[720px] max-h-[90vh] w-full max-w-4xl mx-auto my-4"
      }`}
    >
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-[#0d1527] border-b border-cyan-500/20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/20 shrink-0">
            <Bot className="h-5 w-5 text-slate-950" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1527] animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{isBn ? "এগ্রিশিফট এআই সহকারী" : "AgriShift AI Assistant"}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono px-1.5 py-0 border-cyan-500/40 text-cyan-400 bg-cyan-950/40"
                >
                  LangChain LCEL
                </Badge>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <Satellite className="h-3 w-3 text-cyan-400 shrink-0" />
              <span>
                {settings.provider === "google"
                  ? `Google Gemini (${settings.modelName})`
                  : settings.provider === "openai"
                    ? `OpenAI (${settings.modelName})`
                    : isBn
                      ? "অফলাইন ইন্টেলিজেন্ট ইঞ্জিন (নাসা উপাত্ত গ্রাউন্ডেড)"
                      : "Embedded Offline Agent (NASA Grounded)"}
              </span>
            </p>
          </div>
        </div>

        {/* Header Actions: District Selector & Controls */}
        <div className="flex items-center gap-2">
          {/* District Context Selector */}
          <div className="flex items-center gap-1 bg-[#131d36] px-2 py-1 rounded-lg border border-slate-700/60">
            <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-slate-200 outline-none cursor-pointer max-w-[110px] sm:max-w-[130px]"
              title={isBn ? "জেলা প্রসঙ্গ পরিবর্তন করুন" : "Select district context"}
            >
              {districtsData.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0f172a] text-white">
                  {isBn ? d.bn : d.name} ({d.division})
                </option>
              ))}
            </select>
          </div>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="h-8 w-8 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
            title={isBn ? "মডেল ও এপিআই সেটিংস" : "Model & API Settings"}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Clear History */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearHistory}
            className="h-8 w-8 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10"
            title={isBn ? "ইতিহাস মুছুন" : "Clear conversation"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/40"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm leading-relaxed ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-500 p-0.5 shadow shrink-0 text-slate-950 font-bold text-xs">
                  ◈
                </div>
              )}

              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                  isUser
                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none"
                    : "bg-[#11192e] text-slate-200 border border-slate-700/50 rounded-tl-none"
                }`}
              >
                {/* Message Header (for Assistant) */}
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-slate-700/40 pb-1.5 mb-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Sparkles className="h-3 w-3" />
                      AgriShift Specialist
                    </span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-cyan-300 flex items-center gap-1"
                      title={isBn ? "কপি করুন" : "Copy"}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">{isBn ? "কপি হয়েছে" : "Copied"}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>{isBn ? "কপি" : "Copy"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Message Body */}
                <div className="whitespace-pre-wrap break-words space-y-1.5 text-xs sm:text-sm">
                  {msg.content}
                </div>

                <div
                  className={`mt-1.5 text-[9px] font-mono text-right ${
                    isUser ? "text-cyan-200/70" : "text-slate-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 shrink-0 text-slate-200">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-sm justify-start">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 p-0.5 shrink-0 border border-cyan-500/30">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="bg-[#11192e] border border-cyan-500/30 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-cyan-300 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {isBn
                  ? "নাসা আর্থ অবজারভেশন উপাত্ত বিশ্লেষণ করা হচ্ছে…"
                  : "Synthesizing NASA telemetry and agronomy models…"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Suggestion Chips */}
      <div className="px-4 py-2 bg-[#0a1020] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-cyan-400/80 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="h-3 w-3" />
          {isBn ? "প্রস্তাবনা:" : "Prompts:"}
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <footer className="p-3 bg-[#0d1527] border-t border-cyan-500/20 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            isBn
              ? `নাসা উপাত্ত বা ফসল নিয়ে প্রশ্ন লিখুন (${currentDistrict?.bn ?? "জেলা"})…`
              : `Ask a question about ${currentDistrict?.name ?? "Bangladesh"} agronomy or NASA data…`
          }
          className="flex-1 bg-[#131d36] border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-400 text-xs sm:text-sm h-10"
          disabled={loading}
        />
        <Button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="h-10 px-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </footer>

      {/* Settings Modal (LangChain Model & API Key Configuration) */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-[#0b1222] border-cyan-500/30 text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <span>{isBn ? "ল্যাংচেইন এআই ইঞ্জিন সেটিংস" : "LangChain AI Engine Settings"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {isBn
                ? "আপনি অফলাইন এমবেডেড ইঞ্জিন ব্যবহার করতে পারেন অথবা আপনার নিজস্ব গুগল জেমিনি / ওপেনএআই এপিআই কি দিয়ে লাইভ লার্জ ল্যাঙ্গুয়েজ মডেল চালাতে পারেন।"
                : "Choose between the embedded offline engine (no key required) or connect your own Google Gemini / OpenAI API key."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Provider Selection */}
            <div>
              <label className="font-semibold block mb-1.5 text-slate-300">
                {isBn ? "এলএলএম প্রোভাইডার নির্বাচন করুন:" : "Select LLM Provider:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, provider: "offline" })}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    settings.provider === "offline"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                      : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-bold text-[11px] flex items-center gap-1">
                    ⚡ {isBn ? "অফলাইন" : "Offline"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isBn ? "কোনো কি লাগবে না" : "Zero keys / Free"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, provider: "google" })}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    settings.provider === "google"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                      : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-bold text-[11px] flex items-center gap-1">🌟 Google</span>
                  <span className="text-[10px] text-slate-400">Gemini 1.5/2.0</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, provider: "openai" })}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    settings.provider === "openai"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                      : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="font-bold text-[11px] flex items-center gap-1">🤖 OpenAI</span>
                  <span className="text-[10px] text-slate-400">GPT-4o mini</span>
                </button>
              </div>
            </div>

            {/* Provider specific inputs */}
            {settings.provider === "google" && (
              <div className="space-y-3 bg-[#11192e] p-3 rounded-lg border border-slate-700">
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">
                    Google Gemini API Key:
                  </label>
                  <Input
                    type="password"
                    placeholder="AIzaSy..."
                    value={settings.geminiKey}
                    onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
                    className="bg-[#090d19] border-slate-700 text-xs h-9"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Get a free key at{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline inline-flex items-center gap-0.5"
                    >
                      Google AI Studio <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </span>
                </div>
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">Model:</label>
                  <select
                    value={settings.modelName}
                    onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                    className="w-full bg-[#090d19] border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="gemini-3.8-flash">
                      gemini-3.8-flash (Recommended & Ultra-Fast)
                    </option>
                    <option value="gemini-flash-latest">gemini-flash-latest (Auto-Updated)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep reasoning)</option>
                    <option value="gemini-3.5-flash">gemini-3.5-flash (High Throughput)</option>
                  </select>
                </div>
              </div>
            )}

            {settings.provider === "openai" && (
              <div className="space-y-3 bg-[#11192e] p-3 rounded-lg border border-slate-700">
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">OpenAI API Key:</label>
                  <Input
                    type="password"
                    placeholder="sk-proj-..."
                    value={settings.openaiKey}
                    onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                    className="bg-[#090d19] border-slate-700 text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">Model:</label>
                  <select
                    value={settings.modelName}
                    onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                    className="w-full bg-[#090d19] border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective & Fast)</option>
                    <option value="gpt-4o">gpt-4o (Full capability)</option>
                  </select>
                </div>
              </div>
            )}

            {settings.provider === "offline" && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>100% Offline & Free Mode Active</span>
                </div>
                <p className="text-slate-300">
                  {isBn
                    ? "এই মোডে ল্যাংচেইনের লোকাল রুল-বেসড গ্রাউন্ডেড ইঞ্জিন সক্রিয় থাকে। ৭টি নাসা উপগ্রহ ডেটাসেট ও ৬৪ জেলার তথ্যের ভিত্তিতে সঠিক উত্তর পাবেন।"
                    : "Runs locally using AgriShift's pre-cached NASA datasets, 64-district telemetry, and disaster-resilience rules without sending data over the internet."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="border-slate-700 text-slate-300 text-xs"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveSettings(settings)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs"
            >
              {isBn ? "সংরক্ষণ করুন" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

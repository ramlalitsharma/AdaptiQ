"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Failed to connect to server");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Send className="w-24 h-24 rotate-12" />
            </div>

            <div className="relative z-10 text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">Join the Al Brain-Trust</h3>
                <p className="text-slate-400 text-sm">
                    Get weekly deep-dives into AI pedagogy, adaptive learning research, and platform updates.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input
                        type="email"
                        placeholder="engineers@adaptiq.ai"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "loading" || status === "success"}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                        required
                    />
                    <Button
                        type="submit"
                        disabled={status === "loading" || status === "success"}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        {status === "loading" ? "Processing..." : "Subscribe"}
                    </Button>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`text-sm font-medium ${status === "success" ? "text-emerald-400" : "text-rose-400"
                                } pt-2`}
                        >
                            {status === "success" && <CheckCircle2 className="inline w-4 h-4 mr-2" />}
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

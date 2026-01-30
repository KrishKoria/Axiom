"use client";

import { SparklesIcon, CodeIcon, LightbulbIcon, ZapIcon } from "lucide-react";
import { motion } from "motion/react";

const suggestions = [
  {
    icon: CodeIcon,
    text: "Explain this code",
    description: "Get detailed explanations",
  },
  {
    icon: LightbulbIcon,
    text: "Suggest improvements",
    description: "Optimize your code",
  },
  {
    icon: ZapIcon,
    text: "Fix errors",
    description: "Debug and resolve issues",
  },
];

export function ConversationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      {/* Central orb with glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative mb-8"
      >
        {/* Outer glow rings */}
        <div className="absolute inset-0 scale-150">
          <div className="absolute inset-0 rounded-full bg-ai/10 blur-2xl animate-pulse" />
        </div>
        <div className="absolute inset-0 scale-125">
          <div className="absolute inset-0 rounded-full bg-ai/5 blur-xl" />
        </div>

        {/* Main orb */}
        <div className="relative size-16 rounded-2xl bg-linear-to-br from-ai/20 via-ai/10 to-transparent flex items-center justify-center ring-1 ring-ai/20 backdrop-blur-sm shadow-lg shadow-ai/10">
          <SparklesIcon className="size-7 text-ai" />
        </div>

        {/* Orbiting particle */}
        <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-ai/60" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center mb-8"
      >
        <h3 className="text-lg font-medium mb-2 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          How can I help?
        </h3>
        <p className="text-sm text-muted-foreground/70 max-w-70">
          Ask questions about your code, get suggestions, or explore new ideas
        </p>
      </motion.div>

      {/* Suggestion cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-2 w-full max-w-70"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
            className="group flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 ring-1 ring-transparent hover:ring-ai/20 transition-all duration-200 text-left"
          >
            <div className="size-8 rounded-md bg-background/80 flex items-center justify-center ring-1 ring-border/50 group-hover:ring-ai/30 group-hover:bg-ai/5 transition-all duration-200">
              <suggestion.icon className="size-4 text-muted-foreground group-hover:text-ai transition-colors duration-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                {suggestion.text}
              </div>
              <div className="text-xs text-muted-foreground/60">
                {suggestion.description}
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/50"
      >
        <kbd className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px] ring-1 ring-border/30">
          ⌘
        </kbd>
        <span>+</span>
        <kbd className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px] ring-1 ring-border/30">
          K
        </kbd>
        <span className="ml-1">to focus</span>
      </motion.div>
    </div>
  );
}

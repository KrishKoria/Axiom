"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

interface PreviewTerminalProps {
  output: string;
}

// Purple-tinted terminal theme matching Axiom design system
const TERMINAL_THEME = {
  background: "#1e1b2e", // Deep purple-tinted background (oklch ~0.17 0.02 284)
  foreground: "#e8e4f0", // Light purple-tinted foreground
  cursor: "#a78bfa", // Violet cursor (primary)
  cursorAccent: "#1e1b2e",
  selectionBackground: "#4c3d6650", // Muted violet selection
  selectionForeground: "#e8e4f0",

  // ANSI colors - purple-tinted variants
  black: "#1e1b2e",
  red: "#f87171", // Destructive
  green: "#86efac", // Success
  yellow: "#fbbf24", // Warning
  blue: "#93c5fd",
  magenta: "#c4b5fd", // Violet
  cyan: "#67e8f9", // AI accent
  white: "#e8e4f0",

  // Bright variants
  brightBlack: "#4a4458",
  brightRed: "#fca5a5",
  brightGreen: "#a7f3d0",
  brightYellow: "#fcd34d",
  brightBlue: "#bfdbfe",
  brightMagenta: "#ddd6fe",
  brightCyan: "#a5f3fc", // AI accent bright
  brightWhite: "#f5f3ff",
};

export const PreviewTerminal = ({ output }: PreviewTerminalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastLengthRef = useRef(0);

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new Terminal({
      convertEol: true,
      disableStdin: true,
      fontSize: 12,
      fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      lineHeight: 1.4,
      letterSpacing: 0,
      theme: TERMINAL_THEME,
      cursorBlink: false,
      cursorStyle: "block",
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Write existing output on mount
    if (output) {
      terminal.write(output);
      lastLengthRef.current = output.length;
    }

    requestAnimationFrame(() => fitAddon.fit());

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
    // "output" does not need to be a dependency since it is not intended
    // to update anything, just used on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write output
  useEffect(() => {
    if (!terminalRef.current) return;

    if (output.length < lastLengthRef.current) {
      terminalRef.current.clear();
      lastLengthRef.current = 0;
    }

    const newData = output.slice(lastLengthRef.current);
    if (newData) {
      terminalRef.current.write(newData);
      lastLengthRef.current = output.length;
    }
  }, [output]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 px-3 py-2 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full!"
      style={{ backgroundColor: TERMINAL_THEME.background }}
    />
  );
};

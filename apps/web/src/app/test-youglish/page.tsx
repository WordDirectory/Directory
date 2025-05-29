"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    YG?: {
      Widget: new (elementId: string, options: any) => any;
    };
    onYouglishAPIReady?: () => void;
  }
}

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

export default function TestYouglishPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [word, setWord] = useState("breath");
  const [widgetCount, setWidgetCount] = useState(0);
  const widgetRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  const log = (message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, entry]);
  };

  useEffect(() => {
    // Load YouGlish API
    log("Loading YouGlish API script...");
    const script = document.createElement("script");
    script.src = "https://youglish.com/public/emb/widget.js";
    script.async = true;

    script.onload = () => {
      log("Script tag loaded");
    };

    script.onerror = () => {
      log("Failed to load YouGlish script", "error");
    };

    // Set up the callback
    window.onYouglishAPIReady = () => {
      log("YouGlish API Ready!", "success");
      log(`window.YG available: ${typeof window.YG !== "undefined"}`);
      setIsApiReady(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.onYouglishAPIReady;
    };
  }, []);

  const clearWidget = () => {
    const container = document.getElementById("widget-container");
    if (container) {
      container.innerHTML = "";
    }
    widgetRef.current = null;
    log("Widget cleared");
  };

  const testBasicWidget = () => {
    if (!isApiReady || !window.YG) {
      log("YouGlish API not ready yet", "error");
      return;
    }

    clearWidget();
    const widgetId = `widget-${widgetCount + 1}`;
    setWidgetCount((prev) => prev + 1);

    log(`Creating basic widget for word: "${word}"`);

    const container = document.getElementById("widget-container");
    if (!container) return;

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;
    container.appendChild(widgetDiv);

    try {
      widgetRef.current = new window.YG.Widget(widgetId, {
        width: 640,
        height: 360,
        components: 255, // All components
        events: {
          onFetchDone: (event: any) => {
            log(`Fetch done! Total results: ${event.totalResult}`, "success");
          },
          onError: (event: any) => {
            log(`Error occurred: ${event.code}`, "error");
          },
          onPlayerReady: () => {
            log("Player ready");
          },
          onStateChange: (event: any) => {
            log(`State changed: ${event.state}`);
          },
        },
      });

      log("Widget created, fetching...");
      widgetRef.current.fetch(word, "english");
    } catch (error: any) {
      log(`Error creating widget: ${error.message}`, "error");
    }
  };

  const testMinimalWidget = () => {
    if (!isApiReady || !window.YG) {
      log("YouGlish API not ready yet", "error");
      return;
    }

    clearWidget();
    const widgetId = `widget-${widgetCount + 1}`;
    setWidgetCount((prev) => prev + 1);

    log(`Creating minimal widget for word: "${word}"`);

    const container = document.getElementById("widget-container");
    if (!container) return;

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;
    container.appendChild(widgetDiv);

    try {
      widgetRef.current = new window.YG.Widget(widgetId, {
        width: 640,
        height: 360,
        components: 0, // No components, just video
        events: {
          onFetchDone: (event: any) => {
            log(`Fetch done! Total results: ${event.totalResult}`, "success");
          },
          onError: (event: any) => {
            log(`Error occurred: ${event.code}`, "error");
          },
        },
      });

      log("Minimal widget created, fetching...");
      widgetRef.current.fetch(word, "english");
    } catch (error: any) {
      log(`Error creating widget: ${error.message}`, "error");
    }
  };

  const testInvisibleWidget = () => {
    if (!isApiReady || !window.YG) {
      log("YouGlish API not ready yet", "error");
      return;
    }

    clearWidget();
    const widgetId = `widget-${widgetCount + 1}`;
    setWidgetCount((prev) => prev + 1);

    log(`Creating INVISIBLE widget for word: "${word}"`);
    log("Testing different hiding methods...");

    const container = document.getElementById("widget-container");
    if (!container) return;

    // Create a wrapper div to contain everything
    const wrapperDiv = document.createElement("div");
    wrapperDiv.id = "widget-wrapper";
    wrapperDiv.style.position = "fixed";
    wrapperDiv.style.left = "-9999px";
    wrapperDiv.style.top = "-9999px";
    wrapperDiv.style.overflow = "hidden";
    wrapperDiv.style.width = "640px";
    wrapperDiv.style.height = "360px";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = widgetId;

    wrapperDiv.appendChild(widgetDiv);
    container.appendChild(wrapperDiv);

    // Log what's in the DOM before widget creation
    log(`DOM before widget: ${container.children.length} children`);

    try {
      widgetRef.current = new window.YG.Widget(widgetId, {
        width: 640,
        height: 360,
        components: 0, // No components
        autoStart: 1, // Autoplay
        events: {
          onFetchDone: (event: any) => {
            log(
              `[INVISIBLE] Fetch done! Total results: ${event.totalResult}`,
              "success"
            );

            // Check DOM after widget loads
            setTimeout(() => {
              log(
                `DOM after widget: ${document.body.children.length} body children`
              );

              // Look for any YouGlish elements outside our container
              const allElements = document.querySelectorAll("*");
              allElements.forEach((el) => {
                if (el.id && el.id.includes("youglish") && el.id !== widgetId) {
                  log(
                    `Found YouGlish element: ${el.tagName} #${el.id} at position: ${
                      (el as HTMLElement).style.position || "static"
                    }`
                  );
                }
                if (
                  el.className &&
                  typeof el.className === "string" &&
                  el.className.includes("youglish")
                ) {
                  log(`Found YouGlish element: ${el.tagName} .${el.className}`);
                }
              });

              // Check if widget created any iframes
              const iframes = document.querySelectorAll("iframe");
              iframes.forEach((iframe, i) => {
                log(
                  `Found iframe ${i}: src=${iframe.src || "no-src"}, parent=${
                    iframe.parentElement?.id || "unknown"
                  }`
                );
              });
            }, 1000);
          },
          onError: (event: any) => {
            log(`[INVISIBLE] Error occurred: ${event.code}`, "error");
          },
          onPlayerReady: () => {
            log("[INVISIBLE] Player ready");
          },
          onStateChange: (event: any) => {
            log(`[INVISIBLE] State changed: ${event.state}`);
          },
        },
      });

      log("Widget instance created, fetching...");
      widgetRef.current.fetch(word, "english");
    } catch (error: any) {
      log(`Error creating invisible widget: ${error.message}`, "error");
    }
  };

  const hideMethod1 = () => {
    const wrapper = document.getElementById("widget-wrapper");
    if (wrapper) {
      wrapper.style.display = "none";
    }
    // Also try to hide any YouGlish elements
    document.querySelectorAll('[id*="youglish"]').forEach((el) => {
      if (el.id !== `widget-${widgetCount}`) {
        (el as HTMLElement).style.display = "none";
      }
    });
    log("Applied display: none to wrapper and YouGlish elements");
  };

  const hideMethod2 = () => {
    const wrapper = document.getElementById("widget-wrapper");
    if (wrapper) {
      wrapper.style.visibility = "hidden";
    }
    document.querySelectorAll('[id*="youglish"]').forEach((el) => {
      if (el.id !== `widget-${widgetCount}`) {
        (el as HTMLElement).style.visibility = "hidden";
      }
    });
    log("Applied visibility: hidden");
  };

  const hideMethod3 = () => {
    const wrapper = document.getElementById("widget-wrapper");
    if (wrapper) {
      wrapper.style.opacity = "0";
      wrapper.style.pointerEvents = "none";
    }
    document.querySelectorAll('[id*="youglish"]').forEach((el) => {
      if (el.id !== `widget-${widgetCount}`) {
        (el as HTMLElement).style.opacity = "0";
        (el as HTMLElement).style.pointerEvents = "none";
      }
    });
    log("Applied opacity: 0 and pointer-events: none");
  };

  const showAllHidden = () => {
    const wrapper = document.getElementById("widget-wrapper");
    if (wrapper) {
      wrapper.style.position = "static";
      wrapper.style.left = "auto";
      wrapper.style.top = "auto";
      wrapper.style.display = "block";
      wrapper.style.visibility = "visible";
      wrapper.style.opacity = "1";
      wrapper.style.pointerEvents = "auto";
    }

    document.querySelectorAll('[id*="youglish"]').forEach((el) => {
      (el as HTMLElement).style.display = "block";
      (el as HTMLElement).style.visibility = "visible";
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.pointerEvents = "auto";
    });
    log("Made all elements visible");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">YouGlish API Test</h1>

      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter a word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                testBasicWidget();
              }
            }}
            className="max-w-xs"
          />
          <div className="text-sm text-muted-foreground pt-2">
            API Ready: {isApiReady ? "✅" : "⏳"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={testBasicWidget} disabled={!isApiReady}>
            Test Basic Widget
          </Button>
          <Button onClick={testMinimalWidget} disabled={!isApiReady}>
            Test Minimal Widget
          </Button>
          <Button onClick={testInvisibleWidget} disabled={!isApiReady}>
            Test Invisible Widget
          </Button>
          <Button onClick={clearWidget} variant="outline">
            Clear Widget
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={hideMethod1} variant="secondary" size="sm">
            Hide Method 1: Display None
          </Button>
          <Button onClick={hideMethod2} variant="secondary" size="sm">
            Hide Method 2: Visibility Hidden
          </Button>
          <Button onClick={hideMethod3} variant="secondary" size="sm">
            Hide Method 3: Opacity 0
          </Button>
          <Button onClick={showAllHidden} variant="secondary" size="sm">
            Show All Hidden
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Status Log:</h3>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`text-sm font-mono ${
                log.type === "error"
                  ? "text-red-600"
                  : log.type === "success"
                    ? "text-green-600"
                    : "text-blue-600"
              }`}
            >
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Widget will appear here */}
      <div id="widget-container" className="mt-6" />
    </div>
  );
}

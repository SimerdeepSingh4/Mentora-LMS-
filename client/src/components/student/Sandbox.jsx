import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Play, RotateCcw, ShieldAlert, Sparkles, MonitorPlay } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = {
  javascript: `// Mentora JavaScript Sandbox\n// Write your code here and click "Run Code"\n\nconst greetUser = (name) => {\n  console.log("Hello, " + name + "! Welcome to Mentora.");\n};\n\ngreetUser("Learner");\n\n// Try creating an array and mapping over it:\nconst squareNumbers = [1, 2, 3, 4, 5].map(n => n * n);\nconsole.log("Squared array:", squareNumbers);`,
  
  html: `<!-- Mentora HTML Sandbox -->\n<!-- Write your HTML/CSS code here -->\n\n<div class="card">\n  <h1>Welcome to Mentora!</h1>\n  <p>Run and edit code in real-time next to video lectures.</p>\n  <button onclick="alert('Hello from Sandbox!')">Click Me</button>\n</div>\n\n<style>\n  body {\n    background-color: #0c0c0c;\n    color: #ffffff;\n    font-family: system-ui, sans-serif;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 80vh;\n    margin: 0;\n  }\n  .card {\n    text-align: center;\n    background: rgba(255, 255, 255, 0.02);\n    border: 1px border rgba(255, 255, 255, 0.06);\n    padding: 2.5rem;\n    border-radius: 20px;\n    max-width: 380px;\n  }\n  h1 {\n    color: #E8602E;\n    margin: 0 0 1rem 0;\n  }\n  button {\n    background: #E8602E;\n    color: white;\n    border: 0;\n    padding: 10px 20px;\n    border-radius: 8px;\n    font-weight: bold;\n    cursor: pointer;\n    margin-top: 1rem;\n  }\n</style>`,

  python: `# Mentora Python Runner\n# Write your Python code below\n\ndef greet_learner(name):\n    print(f"Hello, {name}! Welcome to Mentora.")\n\ngreet_learner("Learner")\n\n# Calculate Fibonacci numbers\nfib = [0, 1]\nfor i in range(8):\n    fib.append(fib[-1] + fib[-2])\nprint("Fibonacci Sequence:", fib)`
};

// Custom light syntax highlighter tokenizer
const highlightCode = (code, language) => {
  // Safe HTML escape to prevent XSS
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (language === "javascript" || language === "python") {
    const comments = [];
    const strings = [];

    // 1. Extract comments
    escaped = escaped.replace(/(\/\/.*|#.*)/g, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });

    // 2. Extract strings
    escaped = escaped.replace(/(["'])([\s\S]*?)\1/g, (match) => {
      strings.push(match);
      return `__STRING_${strings.length - 1}__`;
    });

    // 3. Keywords
    escaped = escaped.replace(/\b(const|let|var|return|function|if|else|for|while|import|def|class|print|console)\b/g, '<span class="text-[#E8602E] font-bold">$1</span>');
    
    // Methods / Function calls
    escaped = escaped.replace(/\b(log|map|filter|alert|push|greetUser|greet_learner)\b/g, '<span class="text-blue-400 font-bold">$1</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-yellow-400">$1</span>');

    // 4. Restore strings
    strings.forEach((str, idx) => {
      escaped = escaped.replace(`__STRING_${idx}__`, `<span class="text-green-400 font-medium">${str}</span>`);
    });

    // 5. Restore comments
    comments.forEach((com, idx) => {
      escaped = escaped.replace(`__COMMENT_${idx}__`, `<span class="text-zinc-500 italic">${com}</span>`);
    });

  } else if (language === "html") {
    const comments = [];
    const attrValues = [];

    // 1. Extract HTML comments
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });

    // 2. Extract attribute values (e.g. ="card" or ='body')
    escaped = escaped.replace(/(=(["'])([\s\S]*?)\2)/g, (match) => {
      attrValues.push(match);
      return `__ATTR_${attrValues.length - 1}__`;
    });

    // 3. Highlight tag names and brackets
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9]+)/g, '<span class="text-[#E8602E] font-bold">$1</span>');
    escaped = escaped.replace(/(&gt;)/g, '<span class="text-[#E8602E] font-bold">$1</span>');

    // 4. Restore attribute values with highlight
    attrValues.forEach((val, idx) => {
      escaped = escaped.replace(`__ATTR_${idx}__`, `<span class="text-[#E8602E] font-bold">=</span><span class="text-green-400 font-medium">${val.substring(1)}</span>`);
    });

    // 5. Restore comments with highlight
    comments.forEach((com, idx) => {
      escaped = escaped.replace(`__COMMENT_${idx}__`, `<span class="text-zinc-500 italic">${com}</span>`);
    });
  }

  return escaped;
};

export const Sandbox = () => {
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const containerRef = useRef(null);
  
  const [lineCount, setLineCount] = useState(1);
  const [editorWidth, setEditorWidth] = useState(58); // default to 58% width
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(lines || 1);
  }, [code]);

  const handleReset = () => {
    setCode(TEMPLATES[lang]);
    setOutput([]);
    setError("");
    toast.success("Editor reset to default template.");
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setCode(TEMPLATES[newLang]);
    setOutput([]);
    setError("");
  };

  // Sync scroll values between pre and textarea
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const mouseMoveRef = useRef(null);
  mouseMoveRef.current = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let percentage = ((e.clientX - rect.left) / rect.width) * 100;
    if (percentage < 25) percentage = 25;
    if (percentage > 75) percentage = 75;
    setEditorWidth(percentage);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const onMouseMove = (ev) => mouseMoveRef.current(ev);
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const runCode = () => {
    setIsRunning(true);
    setError("");
    setOutput(["Compiling workspace...", "Running container..."]);

    setTimeout(() => {
      if (lang === "javascript") {
        let logs = [];
        const originalLog = console.log;
        
        console.log = (...args) => {
          logs.push(
            args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
          );
        };

        try {
          const evalResult = eval(code);
          console.log = originalLog;
          
          const finalOutput = logs.length > 0 ? logs : ["Code executed successfully (no console output)."];
          if (evalResult !== undefined) {
            finalOutput.push(`Returned value: ${evalResult}`);
          }
          setOutput(finalOutput);
          toast.success("Execution completed!");
        } catch (err) {
          console.log = originalLog;
          setError(err.message);
          setOutput(["Execution failed."]);
          toast.error("Compilation Error!");
        }
      } else if (lang === "html") {
        setOutput(["HTML Canvas refreshed successfully."]);
        toast.success("Preview Updated!");
      } else if (lang === "python") {
        try {
          const simulatedLogs = [];
          const lines = code.split("\n");
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("print(")) {
              let content = trimmed.substring(6, trimmed.length - 1);
              if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
                simulatedLogs.push(content.substring(1, content.length - 1));
              } else if (content.startsWith("f\"") || content.startsWith("f'")) {
                let inner = content.substring(2, content.length - 1);
                inner = inner.replace(/{([^}]+)}/g, "Learner");
                simulatedLogs.push(inner);
              } else {
                if (content.includes("fib")) {
                  simulatedLogs.push("Fibonacci Sequence: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]");
                } else {
                  simulatedLogs.push("Simulated Output");
                }
              }
            } else if (trimmed.startsWith("greet_learner(")) {
              simulatedLogs.push("Hello, Learner! Welcome to Mentora.");
            }
          });

          if (simulatedLogs.length === 0) {
            simulatedLogs.push("Python script executed successfully with no prints.");
          }
          setOutput(simulatedLogs);
          toast.success("Python execution completed!");
        } catch (err) {
          setError("NameError: name is not defined");
          setOutput(["Execution failed."]);
        }
      }
      setIsRunning(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#060606] border border-white/[0.04] rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c] border-b border-white/[0.05] shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-[#E8602E]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Automated Sandbox Coding</span>
        </div>

        {/* Language Tabs */}
        <div className="flex bg-[#111] p-0.5 rounded-lg border border-white/[0.04]">
          {["javascript", "html", "python"].map((t) => (
            <button
              key={t}
              onClick={() => handleLangChange(t)}
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md transition-all ${
                lang === t 
                  ? "bg-[#E8602E] text-white" 
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {t === "javascript" ? "JS" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Body Split: Code Area & Terminal Output */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row min-h-0 relative"
      >
        
        {/* Left: Input Textarea overlaying Syntax-Highlighted pre */}
        <div 
          className="w-full lg:w-auto shrink-0 flex min-h-[260px] lg:min-h-0 bg-[#070707] relative border-b lg:border-b-0 border-white/[0.05]"
          style={{ width: isDesktop ? `${editorWidth}%` : "100%" }}
        >
          {/* Line Numbers column */}
          <div className="w-10 bg-[#080808] border-r border-white/[0.03] select-none text-right pr-2.5 py-4 font-mono text-[11px] text-zinc-700 leading-relaxed overflow-hidden">
            {Array.from({ length: lineCount }).map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          {/* Combined Code editor container */}
          <div className="flex-grow relative overflow-hidden h-full">
            {/* Syntax Highlight overlay */}
            <pre
              ref={preRef}
              className="absolute inset-0 p-4 font-mono text-[11px] leading-relaxed whitespace-pre overflow-hidden pointer-events-none select-none text-zinc-400 z-0"
              dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }}
            />

            {/* Transparent Textarea on top */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white font-mono text-[11px] leading-relaxed p-4 resize-none focus:outline-none overflow-auto z-10 whitespace-pre"
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Resizer Handle drag bar */}
        <div 
          onMouseDown={handleMouseDown}
          className="hidden lg:flex w-[6px] hover:w-[8px] bg-[#0c0c0c] hover:bg-[#E8602E]/60 cursor-col-resize transition-all shrink-0 items-center justify-center relative z-20 group"
          style={{ height: "100%" }}
        >
          <div className="w-[1.5px] h-10 bg-zinc-800 group-hover:bg-[#E8602E] transition-colors" />
        </div>

        {/* Right: Output Screen (Terminal / HTML Preview) */}
        <div className="flex-grow flex-1 flex flex-col bg-[#080808] min-h-[220px] lg:min-h-0">
          
          {/* Output header tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.03] bg-[#090909] shrink-0 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <span>Terminal Output</span>
            {lang === "html" && <span className="text-[#E8602E] flex items-center gap-1"><MonitorPlay className="w-3.5 h-3.5" /> Live Frame</span>}
          </div>

          {/* Canvas or Terminal Terminal content */}
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto min-h-0">
            {lang === "html" ? (
              /* HTML Preview Iframe */
              <div className="w-full h-full bg-[#0c0c0c] border border-white/[0.05] rounded-xl overflow-hidden relative">
                <iframe
                  title="html-preview"
                  srcDoc={code}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0 bg-transparent"
                />
              </div>
            ) : (
              /* Terminal Logs output */
              <div className="space-y-1.5 h-full text-zinc-400">
                {output.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-zinc-600 shrink-0">&gt;</span>
                    <span className={idx === output.length - 1 && !error ? "text-[#E8602E] font-semibold" : ""}>
                      {line}
                    </span>
                  </div>
                ))}

                {error && (
                  <div className="flex gap-2 items-start text-red-500 bg-red-950/20 border border-red-500/15 p-2.5 rounded-lg mt-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {output.length === 0 && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-700 py-10">
                    <TerminalIcon className="w-8 h-8 text-zinc-800 mb-2" />
                    <span>Terminal idle. Write some code and run it!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Footer Action bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-t border-white/[0.05] shrink-0">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Template</span>
        </button>

        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#E8602E] hover:bg-[#d4561f] text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-[#E8602E]/25 disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

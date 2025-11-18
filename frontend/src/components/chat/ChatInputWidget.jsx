
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Send, Mic, Square } from "lucide-react";

const BACKEND_TRANSCRIBE_URL = "https://test-medic-transcriber-latest.onrender.com/transcribe";

const pickMime = () => {
  const prefs = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
  ];
  for (const t of prefs) {
    if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
  }
  return "";
};

const mimeToExt = (m) => {
  const mime = (m || "").toLowerCase();
  if (mime.startsWith("audio/webm")) return "webm";
  if (mime === "audio/mp4" || mime === "video/mp4") return "mp4";
  if (mime === "audio/mpeg" || mime === "audio/mp3") return "mp3";
  if (mime === "audio/wav" || mime === "audio/x-wav") return "wav";
  if (mime === "audio/ogg" || mime === "audio/oga") return "ogg";
  return "webm";
};

const ChatInputWidget = forwardRef(
  ({ onSendMessage, inputText, setInputText, disabled }, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [err, setErr] = useState(null);

    const textAreaRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const chosenMimeRef = useRef("");

    const adjustTextAreaHeight = (reset = false) => {
      if (!textAreaRef.current) return;
      textAreaRef.current.style.height = "auto";
      if (!reset)
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    };

    useEffect(() => {
      adjustTextAreaHeight();
    }, []);

    const startRecording = useCallback(async () => {
      setErr(null);
      chunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        streamRef.current = stream;

        const mime = pickMime();
        chosenMimeRef.current = mime;
        const mr = new MediaRecorder(
          stream,
          mime ? { mimeType: mime } : undefined
        );
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size) chunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          try {
            const finalMime =
              mr.mimeType ||
              chosenMimeRef.current ||
              chunksRef.current[0]?.type ||
              "audio/webm";
            const blob = new Blob(chunksRef.current, { type: finalMime });
            chunksRef.current = [];
            const ext = mimeToExt(finalMime);
            await transcribeBlob(blob, ext);
          } catch (e) {
            setErr("Failed to process recording.");
          } finally {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            setIsRecording(false);
          }
        };

        mr.start(250);
        setIsRecording(true);
      } catch {
        setErr("Microphone permission denied or unavailable.");
        setIsRecording(false);
      }
    }, []);

    const stopRecording = useCallback(() => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch {}
    }, []);

    const transcribeBlob = useCallback(
      async (blob, ext) => {
        setIsLoading(true);
        setErr(null);
        try {
          const form = new FormData();
          form.append("audio_data", blob, `recording.${ext || "webm"}`);
          const res = await fetch(BACKEND_TRANSCRIBE_URL, {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();

          const newText = (data?.transcript || "").trim();
          setInputText((prev = "") => {
            const merged = prev
              ? `${prev}${prev.endsWith(" ") ? "" : " "}${newText}`
              : newText;
            requestAnimationFrame(adjustTextAreaHeight);
            return merged;
          });
        } catch (e) {
          setErr("Transcription failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      },
      [setInputText]
    );

    const handleSendMessage = () => {
      const val = (inputText || "").trim();
      if (val) {
        onSendMessage?.({ text: val });
        setInputText("");
        adjustTextAreaHeight(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if ((inputText || "").trim()) handleSendMessage();
      }
    };

    const handleIconClick = () => {
      if ((inputText || "").trim()) {
        handleSendMessage();
      } else {
        isRecording ? stopRecording() : startRecording();
      }
    };

    useImperativeHandle(ref, () => ({
      focusInput: () => textAreaRef.current?.focus(),
      setText: (v = "") => {
        setInputText(v);
        requestAnimationFrame(() => adjustTextAreaHeight());
      },
      clear: () => {
        setInputText("");
        adjustTextAreaHeight(true);
      },
      submit: () => handleSendMessage(),
      startRecording: () => startRecording(),
      stopRecording: () => stopRecording(),
    }));

    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full">
            <div className="flex items-center gap-3 glass-card px-4 py-3 rounded-xl shadow-lg">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Transcribing…</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-2 rounded-full glass-card border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.1),inset_0_2px_8px_rgba(0,0,0,0.05)]">
          <textarea
            ref={textAreaRef}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm focus:outline-none min-h-[48px] max-h-[100px] placeholder:text-muted-foreground/60 border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]"
            placeholder={
              isRecording
                ? "Recording… press stop when done"
                : "Chat in text or start speaking..."
            }
            value={inputText || ""}
            onChange={(e) => {
              setInputText(e.target.value);
              adjustTextAreaHeight();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || disabled}
          />

          <button
            onClick={handleIconClick}
            disabled={isLoading || disabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_2px_10px_rgba(0,0,0,0.15)] ${
              (inputText || "").trim()
                ? "bg-[#6366F1] hover:bg-[#5558E3] text-white"
                : isRecording
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-[#6366F1] hover:bg-[#5558E3] text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {(inputText || "").trim() ? (
              <Send className="w-5 h-5" />
            ) : isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>

        {err && (
          <div className="mt-2 text-xs text-destructive px-4">
            {err}
          </div>
        )}
      </div>
    );
  }
);

ChatInputWidget.displayName = "ChatInputWidget";

export default ChatInputWidget;

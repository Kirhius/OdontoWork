"use client";

import { useEffect, useRef, useState } from "react";

// Reconhecimento de voz do próprio navegador (Chrome/Edge no Android e no computador).
// O navegador não traz esses tipos, então declaramos só o que usamos.
interface Alternativa {
  transcript: string;
}
interface ResultadoReconhecido {
  isFinal: boolean;
  length: number;
  [indice: number]: Alternativa;
}
interface EventoResultado {
  results: ArrayLike<ResultadoReconhecido>;
}
interface Reconhecimento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: EventoResultado) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type Construtor = new () => Reconhecimento;

function obterConstrutor(): Construtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: Construtor;
    webkitSpeechRecognition?: Construtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function temReconhecimentoDeVoz(): boolean {
  return obterConstrutor() !== null;
}

function mensagemErro(codigo: string): string {
  switch (codigo) {
    case "not-allowed":
    case "service-not-allowed":
      return "O navegador bloqueou o microfone. Libere a permissão e tente de novo.";
    case "no-speech":
      return "Não ouvi nada. Toque no microfone e fale de novo.";
    case "network":
      return "Sem conexão: o reconhecimento de voz precisa de internet.";
    case "audio-capture":
      return "Não encontrei um microfone.";
    case "aborted":
      return "";
    default:
      return `Não consegui ouvir (erro: ${codigo}).`;
  }
}

interface Props {
  onParcial: (texto: string) => void; // texto aparecendo enquanto a pessoa fala
  onFinal: (texto: string) => void; // frase completa, quando a pessoa para de falar
  onErro: (mensagem: string) => void;
}

export default function BotaoMicrofone({ onParcial, onFinal, onErro }: Props) {
  const [ouvindo, setOuvindo] = useState(false);
  const recRef = useRef<Reconhecimento | null>(null);
  const textoRef = useRef("");
  // Sempre usa as funções mais recentes da tela, mesmo que a escuta comece antes de uma nova renderização.
  const cb = useRef({ onParcial, onFinal, onErro });
  cb.current = { onParcial, onFinal, onErro };

  useEffect(() => {
    return () => recRef.current?.stop();
  }, []);

  function alternar() {
    if (ouvindo) {
      recRef.current?.stop();
      return;
    }
    const Ctor = obterConstrutor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = true;
    textoRef.current = "";

    rec.onresult = (e) => {
      let texto = "";
      for (let i = 0; i < e.results.length; i++) texto += e.results[i][0].transcript;
      textoRef.current = texto.trim();
      cb.current.onParcial(textoRef.current);
    };
    rec.onerror = (e) => cb.current.onErro(mensagemErro(e.error));
    rec.onend = () => {
      setOuvindo(false);
      recRef.current = null;
      if (textoRef.current) cb.current.onFinal(textoRef.current);
    };

    cb.current.onErro("");
    try {
      rec.start();
      recRef.current = rec;
      setOuvindo(true);
    } catch {
      cb.current.onErro("Não consegui iniciar o microfone.");
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ouvindo}
      aria-label={ouvindo ? "Parar de ouvir" : "Falar"}
      title={ouvindo ? "Parar de ouvir" : "Falar"}
      className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 transition-colors ${
        ouvindo ? "bg-coral text-coral-ink" : "bg-mint text-mint-ink"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

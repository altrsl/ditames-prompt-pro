import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/services";

export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.62_0.18_150)] text-white shadow-glow transition-transform hover:scale-110"
    >
      <MessageCircle size={26} />
    </a>
  );
}

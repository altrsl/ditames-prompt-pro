/**
 * Ditames — useSettings
 *
 * Busca a tabela `settings` uma vez e expõe os valores por chave.
 * Sempre retorna um fallback seguro (valores atuais hardcoded) caso
 * a tabela esteja vazia, indisponível, ou a migration ainda não
 * tenha sido executada — o site nunca quebra por causa disso.
 */

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const SETTINGS_FALLBACK: Record<string, string> = {
  phone: "(47) 3300-3466",
  whatsapp_number: "5547996910055",
  whatsapp_display: "(47) 9 9691-0055",
  whatsapp_message: "Olá, vim pelo site da Ditames",
  email: "comercial@ditames.com.br",
  address: "Rua Brasil, 22 — Sumaré, Rio do Sul, SC — CEP 89165-613",
  instagram_url: "https://www.instagram.com/ditamesambiental",
  linkedin_url: "https://www.linkedin.com/company/ditames-ambiental/",
  site_name: "Ditames Ambiental",
  founded_at: "2022-08-16",
};

let cache: Record<string, string> | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(cache ?? SETTINGS_FALLBACK);

  useEffect(() => {
    if (cache) return; // já carregado nesta sessão de navegação

    let cancelled = false;
    supabase
      .from("settings")
      .select("key, value")
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return;
        const merged = { ...SETTINGS_FALLBACK, ...Object.fromEntries(data.map((r) => [r.key, r.value])) };
        cache = merged;
        setSettings(merged);
      });

    return () => { cancelled = true; };
  }, []);

  return settings;
}

export function getWhatsAppUrl(settings: Record<string, string>): string {
  const number = settings.whatsapp_number || SETTINGS_FALLBACK.whatsapp_number;
  const message = settings.whatsapp_message || SETTINGS_FALLBACK.whatsapp_message;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

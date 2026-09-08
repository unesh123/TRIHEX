"use client";

import { useEffect, useState } from "react";

interface BotShieldProps {
  action: string;
}

export function BotShield({ action }: BotShieldProps) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Generate lightweight client timestamp + entropy token
    const ts = Date.now();
    const entropy = Math.random().toString(36).substring(2, 10);
    setToken(`${action}:${ts}:${entropy}`);
  }, [action]);

  return (
    <>
      {/* Dynamic Token */}
      <input type="hidden" name="__bot_shield_token" value={token} />
      
      {/* Honeypot field — hidden from humans via CSS, bots will blindly fill it */}
      <div 
        aria-hidden="true" 
        style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
      >
        <label htmlFor="website_url_hp">Leave this field blank</label>
        <input 
          id="website_url_hp"
          type="text" 
          name="__website_hp" 
          tabIndex={-1} 
          autoComplete="off" 
        />
      </div>
    </>
  );
}

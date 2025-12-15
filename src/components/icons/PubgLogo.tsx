import Image from "next/image";
import { siteConfig } from "@/config/site";

export function PubgLogo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={siteConfig.header.logo.url} 
        alt={siteConfig.header.logo.alt}
        width={40}
        height={40}
        className="rounded-md"
      />
      <span className="font-bold text-lg text-white whitespace-nowrap">
        {siteConfig.name}
      </span>
    </div>
  );
}

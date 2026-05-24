type PubgLogoProps = {
  logoAlt: string;
  logoUrl: string;
  siteName: string;
};

export function PubgLogo({ logoAlt, logoUrl, siteName }: PubgLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={logoUrl}
        alt={logoAlt}
        width={40}
        height={40}
        className="rounded-md"
      />
      <span className="font-bold text-lg text-white whitespace-nowrap">
        {siteName}
      </span>
    </div>
  );
}

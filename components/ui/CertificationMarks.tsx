import Image from "next/image";

/**
 * Official Indian statutory registration marks shown on the export page:
 * - FSSAI (Food Safety and Standards Authority of India)
 * - MSME (Ministry of Micro, Small & Medium Enterprises, Government of India)
 */

export function FssaiMark({ className = "h-auto w-full object-contain" }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
      src="/images/fssai-logo.png"
      alt="FSSAI Logo"
      width={120}
      height={60}
      className={className}
    />
  );
}

export function MsmeMark({ className = "h-auto w-full object-contain" }: { className?: string; width?: number; height?: number }) {
  return (
    <Image
      src="/images/msme-logo.svg"
      alt="MSME Logo"
      width={80}
      height={80}
      className={className}
    />
  );
}

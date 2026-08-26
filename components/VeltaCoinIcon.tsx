type VeltaCoinIconProps = {
  size?: "sm" | "md" | "lg";
};

export default function VeltaCoinIcon({ size = "md" }: VeltaCoinIconProps) {
  const sizeClass = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-2xl",
  }[size];

  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full border-4 border-white bg-red-600 font-black tracking-[-0.08em] text-white shadow-[0_5px_0_rgba(127,29,29,0.8)] ${sizeClass}`} aria-label="VinzzurBucks">
      VC
    </span>
  );
}

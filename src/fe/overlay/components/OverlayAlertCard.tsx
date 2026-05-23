import { formatRupiah } from "@/shared/utils";

interface OverlayAlertCardProps {
  donorName: string;
  amount: number;
  message?: string | null;
  shadowClass: string;
  colors?: {
    overlay_bg_color: string;
    overlay_border_color: string;
    overlay_text_color: string;
    overlay_message_color: string;
    overlay_accent_color: string;
    action_text?: string;
  };
}

export default function OverlayAlertCard({
  donorName,
  amount,
  message,
  shadowClass,
  colors,
}: OverlayAlertCardProps) {
  return (
    <div
      className={`w-full border-2 rounded-2xl px-8 py-10 md:py-12 flex flex-col items-center justify-center text-center relative min-h-[160px] ${shadowClass}`}
      style={{
        backgroundColor: colors?.overlay_bg_color ?? "#1e293b",
        borderColor: colors?.overlay_border_color ?? "#334155",
      }}
    >
      <div className="text-2xl md:text-3xl font-bold tracking-wide mt-2" style={{ color: colors?.overlay_text_color ?? "#fafafa" }}>
        <span style={{ color: colors?.overlay_accent_color ?? "#818cf8" }}>{donorName}</span>{" "}
        {colors?.action_text ?? "berdonasi"}{" "}
        <span style={{ color: colors?.overlay_accent_color ?? "#818cf8" }}>{formatRupiah(amount)}</span>
      </div>

      {message && (
        <div className="mt-4 text-xl md:text-2xl font-medium" style={{ color: colors?.overlay_message_color ?? "#a1a1aa" }}>
          {message}
        </div>
      )}
    </div>
  );
}

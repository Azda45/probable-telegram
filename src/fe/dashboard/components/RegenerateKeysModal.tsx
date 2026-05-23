import { KeyRound, AlertTriangle, X } from "lucide-react";

interface RegenerateKeysModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RegenerateKeysModal({
  onCancel,
  onConfirm,
}: RegenerateKeysModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      {/* Container - Ditambahkan class "relative" */}
      <div className="relative w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button - Diperbaiki posisinya dan digabung menjadi satu */}
        <button
          onClick={onCancel}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>

          {/* Text Container */}
          <div className="flex-1 pt-1">
            <h3 className="pr-6 text-lg font-semibold leading-none text-white">
              Regenerate URL Overlay?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              URL overlay lama akan langsung tidak aktif setelah token diganti.
            </p>
          </div>
        </div>

        {/* Body - Kontras teks ditingkatkan ke text-red-200 */}
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm leading-relaxed text-red-200">
            Token rahasia Anda akan diganti. Setelah ini, perbarui URL di OBS
            atau Streamlabs agar stream overlay tetap berjalan.
          </p>
        </div>

        {/* Actions - Dibuat responsif (vertikal di mobile, horizontal di desktop) */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            onClick={onConfirm}
            className="inline-flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 active:scale-[0.98]"
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            Regenerate Sekarang
          </button>

          <button
            onClick={onCancel}
            className="h-11 w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
interface SettingsFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsField({ label, children, className = "" }: SettingsFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1">{label}</label>
      {children}
    </div>
  );
}

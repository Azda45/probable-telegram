interface SettingsFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsField({ label, children, className = "" }: SettingsFieldProps) {
  return (
    <div className={`flex flex-col ${className}`} style={{ gap: '0.375rem' }}>
      <label className="text-[13px] font-medium text-[var(--color-text-secondary)] ml-1 flex items-center" style={{ gap: '0.375rem' }}>{label}</label>
      {children}
    </div>
  );
}

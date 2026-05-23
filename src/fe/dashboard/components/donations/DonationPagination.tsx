interface DonationPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DonationPagination({ page, totalPages, onPageChange }: DonationPaginationProps) {
  return (
    <div className="flex gap-2 justify-center mt-6">
      <button
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Sebelumnya
      </button>
      <span className="px-4 py-2 text-[13px] text-[var(--color-text-muted)]">
        Halaman {page} dari {totalPages}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Selanjutnya →
      </button>
    </div>
  );
}

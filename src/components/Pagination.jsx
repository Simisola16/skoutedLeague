import React from 'react';

/**
 * Shared Pagination control.
 * Props:
 *   currentPage  – current page number (1-indexed)
 *   totalPages   – total number of pages
 *   totalItems   – total number of items (for the counter)
 *   onPageChange – (page: number) => void
 *   label        – optional noun used in counter, e.g. "fixtures"
 */
export default function Pagination({ currentPage, totalPages, totalItems, onPageChange, label = 'items' }) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis for large page counts
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const btnBase = 'min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center';
  const activeCls = 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]';
  const inactiveCls = 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600';
  const disabledCls = 'bg-[#141720] border-[#222735] text-slate-600 opacity-40 cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 pb-2 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`${btnBase} px-3 ${currentPage === 1 ? disabledCls : inactiveCls}`}
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="text-slate-600 text-xs px-1 select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${currentPage === page ? activeCls : inactiveCls}`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`${btnBase} px-3 ${currentPage === totalPages ? disabledCls : inactiveCls}`}
      >
        Next →
      </button>

      {/* Counter */}
      <span className="text-[11px] text-slate-500 font-mono ml-2">
        {currentPage}/{totalPages} · {totalItems} {label}
      </span>
    </div>
  );
}

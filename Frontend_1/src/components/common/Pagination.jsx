import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(current, total) {
  // Always show first, last, current, and neighbors
  const pages = [];
  const delta = 1; // How many pages to show around current

  if (total <= 7) {
    // Show all pages
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Always include page 1
  pages.push(1);

  // Calculate start and end of the middle range
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  // Add ellipsis before middle range if needed
  if (rangeStart > 2) {
    pages.push('...');
  }

  // Add middle range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis after middle range if needed
  if (rangeEnd < total - 1) {
    pages.push('...');
  }

  // Always include last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);
  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
        className={`flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition-all duration-200 sm:h-11 sm:px-4 ${
          isFirst
            ? 'cursor-not-allowed border-gray-100 text-gray-300'
            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((item, index) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-8 items-center justify-center text-sm text-gray-400 sm:h-11 sm:w-10"
              >
                ···
              </span>
            );
          }

          const isActive = item === page;
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              disabled={isActive}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 sm:h-11 sm:w-11 ${
                isActive
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={`Page ${item}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
        className={`flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition-all duration-200 sm:h-11 sm:px-4 ${
          isLast
            ? 'cursor-not-allowed border-gray-100 text-gray-300'
            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

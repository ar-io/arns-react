import { cn } from '@src/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  className?: string;
  showPrevNext?: boolean;
}

export function Pagination({
  current,
  total,
  pageSize = 10,
  onChange,
  className,
  showPrevNext = true,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (current > 1) {
      onChange?.(current - 1);
    }
  };

  const handleNext = () => {
    if (current < totalPages) {
      onChange?.(current + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {showPrevNext && (
        <button
          className={cn(
            'flex items-center justify-center size-8 rounded hover:bg-surface/50 transition-colors',
            current === 1 && 'opacity-30 cursor-not-allowed',
          )}
          onClick={handlePrev}
          disabled={current === 1}
        >
          <ChevronLeft className="size-4 text-muted" />
        </button>
      )}

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          className={cn(
            'flex items-center justify-center min-w-[32px] h-8 px-2 rounded text-sm transition-colors',
            page === current
              ? 'text-foreground font-medium'
              : page === '...'
                ? 'text-muted cursor-default'
                : 'text-muted hover:text-foreground hover:bg-surface/50',
          )}
          onClick={() => {
            if (typeof page === 'number') {
              onChange?.(page);
            }
          }}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      {showPrevNext && (
        <button
          className={cn(
            'flex items-center justify-center size-8 rounded hover:bg-surface/50 transition-colors',
            current === totalPages && 'opacity-30 cursor-not-allowed',
          )}
          onClick={handleNext}
          disabled={current === totalPages}
        >
          <ChevronRight className="size-4 text-muted" />
        </button>
      )}
    </div>
  );
}

export default Pagination;

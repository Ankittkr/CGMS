import React, { useState } from 'react';
import EmptyState from './EmptyState.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  keyField = '_id',
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching the selected view.',
  pageSize = 7,
  onRowClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  style={col.width ? { width: col.width } : {}}
                  className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentData.map((row) => (
              <tr
                key={row[keyField] || row.id || JSON.stringify(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-slate-50/70 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, idx) => (
                  <td
                    key={col.header || idx}
                    className="px-5 py-3.5 text-xs text-slate-800 align-middle"
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {data.length === 0 ? 0 : startIndex + 1} to{' '}
          {Math.min(startIndex + pageSize, data.length)} of {data.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="font-semibold text-slate-700 px-1">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

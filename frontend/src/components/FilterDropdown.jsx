import React from 'react';
import { Filter } from 'lucide-react';

const FilterDropdown = ({
  label,
  value,
  options = [],
  onChange,
  icon: Icon = Filter,
  allLabel = 'All',
}) => {
  return (
    <div className="relative inline-flex items-center">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3 text-slate-400 pointer-events-none"
        />
      )}
      <select
        className="w-full pl-8 pr-7 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label ? `${label}: ${allLabel}` : allLabel}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {label ? `${label}: ${text}` : text}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FilterDropdown;

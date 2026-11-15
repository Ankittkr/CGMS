import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  isPositive = false,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">
            {value}
          </h3>
          {subtext && (
            <p
              className={`text-xs mt-1.5 font-medium ${
                isPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
          >
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

import React from 'react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    label: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon: React.ReactNode;
  alert?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtitle,
  trend,
  icon,
  alert = false,
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative p-5 bg-white border rounded-xl transition-all duration-150 ${
        alert
          ? 'border-rose-300 bg-rose-50/30'
          : 'border-slate-200 hover:border-slate-300'
      } ${onClick ? 'cursor-pointer hover:shadow-xs' : ''}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div
          className={`p-2 rounded-lg ${
            alert ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-normal">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-xs">
          <span
            className={`font-medium ${
              trend.isNeutral
                ? 'text-slate-600'
                : trend.isPositive
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};

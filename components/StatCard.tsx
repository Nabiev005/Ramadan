
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

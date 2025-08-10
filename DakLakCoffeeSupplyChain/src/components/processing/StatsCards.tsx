"use client";

import { LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const getIconBgColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100";
      case "yellow": return "bg-yellow-100";
      case "green": return "bg-green-100";
      case "red": return "bg-red-100";
      case "purple": return "bg-purple-100";
      default: return "bg-gray-100";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "yellow": return "text-yellow-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getValueColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "yellow": return "text-yellow-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-900";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${getValueColor(stat.color)}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 ${getIconBgColor(stat.color)} rounded-lg`}>
                <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
      case "orange": return "bg-orange-100";
      case "amber": return "bg-amber-100";
      case "blue": return "bg-blue-100";
      case "green": return "bg-green-100";
      case "red": return "bg-red-100";
      case "purple": return "bg-purple-100";
      default: return "bg-gray-100";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "orange": return "text-orange-600";
      case "amber": return "text-amber-600";
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getValueColor = (color: string) => {
    switch (color) {
      case "orange": return "text-orange-600";
      case "amber": return "text-amber-600";
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "purple": return "text-purple-600";
      default: return "text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${getValueColor(stat.color)}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${getIconBgColor(stat.color)} rounded-lg border border-orange-100`}>
                <Icon className={`w-6 h-6 ${getIconColor(stat.color)}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { ProcurementPlan } from '@/lib/api/procurementPlans';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
//import { FaUser } from 'react-icons/fa';
//import CropSeasonDetailDialog from './CropSeasonDetailDialog';
import { ProcurementPlanStatusMap, ProcurementPlanStatusValue } from '@/lib/constrant/procurementPlanStatus';

export default function ProcurementPlanCard({ plan }: { plan: ProcurementPlan }) {
    return (
        <tr key={plan.planId} className="border-t hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="font-medium">{plan.title}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {plan.planCode}
                </div>
            </td>

            <td className="px-4 py-3">{plan.totalQuantity} kg</td>
            <td className="px-4 py-3">{plan.progressPercentage}%</td>

            <td className="px-4 py-3">
                <Badge
                    className={cn(
                        'inline-flex items-center justify-center w-32 h-8 px-2 py-1 text-xs font-medium rounded-full border text-center',
                        plan.status === 'Open'
                            ? 'bg-green-100 text-green-700 border-green-500'
                            : plan.status === 'Closed'
                            ? 'bg-gray-100 text-gray-700 border-gray-500'
                            : plan.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-700 border-rose-500'
                                : plan.status === 'Draft'
                                    ? 'bg-blue-100 text-blue-700 border-blue-500'
                                    : 'bg-red-100 text-red-700 border-red-500'
                    )}
                >
                    {ProcurementPlanStatusMap[plan.status as ProcurementPlanStatusValue]?.label || plan.status}
                </Badge>
            </td>

            <td className="px-4 py-3">
                {new Date(plan.startDate).toLocaleDateString('vi-VN')} –{' '}
                {new Date(plan.endDate).toLocaleDateString('vi-VN')}
            </td>

            <td className="px-4 py-3 text-center align-middle">
                {/* <CropplanDetailDialog plan={plan} /> */}
            </td>
        </tr>
    );
}

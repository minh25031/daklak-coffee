"use client";

import React from 'react';
import ProgressDeviationDashboard from '@/components/progress-deviation-analysis/ProgressDeviationDashboard';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';

export default function ProgressDeviationPage() {
    useAuthGuard(['farmer']);

    return (
        <div className="container mx-auto px-4 py-6">
            <ProgressDeviationDashboard userRole="farmer" />
        </div>
    );
}

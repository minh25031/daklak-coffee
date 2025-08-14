"use client";

import React from 'react';
import ProgressDeviationDashboard from '@/components/progress-deviation-analysis/ProgressDeviationDashboard';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';

export default function ManagerProgressDeviationPage() {
    useAuthGuard(['manager']);

    return (
        <div className="container mx-auto px-4 py-6">
            <ProgressDeviationDashboard userRole="manager" />
        </div>
    );
}

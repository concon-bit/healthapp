// src/features/dashboard/Dashboard.tsx

import React from 'react';
import Layout from '../../components/ui/Layout';
import HealthDashboard from '../health-log/HealthDashboard';
import { useAppSelector } from '../../redux/hooks';

const Dashboard: React.FC = () => {
    const activeMode = useAppSelector((state) => state.ui.activeMode);

    const renderContent = () => {
        switch (activeMode) {
            case 'health':
            default:
                return <HealthDashboard />;
        }
    };

    return <Layout>{renderContent()}</Layout>;
};

export default Dashboard;

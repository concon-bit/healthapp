// src/features/health-log/LogDetailModal.tsx

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Grid,
    Box,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../../constants/appConstants';
import { MOOD_ICONS, POOP_ICONS } from '../../constants/iconConstants';
import type { HealthLog } from '../../types';

interface LogDetailModalProps {
    log: HealthLog | null;
    onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
    if (!log) return null;

    const getSymptomText = (symptoms: Record<string, boolean> | undefined): string => {
        if (!symptoms || Object.keys(symptoms).length === 0) return '記録なし';
        return (
            Object.entries(symptoms)
                .filter(([, value]) => value)
                .map(([key]) => SYMPTOM_OPTIONS[key])
                .join(', ') || '記録なし'
        );
    };

    const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({
        label,
        children,
    }) => (
        <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {children}
            </Typography>
        </Grid>
    );

    return (
        <Dialog open={!!log} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {format(new Date(log.date + 'T00:00:00'), 'yyyy年M月d日')} の記録
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <DetailItem label="体温">
                        {log.temp ? `${log.temp}°C` : '未記録'}
                    </DetailItem>
                    <DetailItem label="水分">
                        {log.waterIntake ? `${log.waterIntake}ml` : '未記録'}
                    </DetailItem>
                    <DetailItem label="今日の体調">
                        {log.mood && MOOD_ICONS[log.mood]}
                        {log.mood ? MOOD_OPTIONS[log.mood] : '未記録'}
                    </DetailItem>
                    <DetailItem label="排便">
                        {log.isPooped && POOP_ICONS[log.isPooped === 'yes' ? 'あり' : 'なし']}
                        {log.isPooped ? (log.isPooped === 'yes' ? 'あり' : 'なし') : '未記録'}
                    </DetailItem>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        症状・アクティビティ
                    </Typography>
                    <Typography variant="body2">{getSymptomText(log.symptoms)}</Typography>
                </Box>

                <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        メモ
                    </Typography>
                    <Typography variant="body2">{log.memo || 'メモはありません'}</Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LogDetailModal;

export interface CombinedAlertItem {
    id: string;
    query: string;
    time: string;
    description: string;
    type: 'alert' | 'anomaly' | 'loitering';
    redirect_url?: string;
    media_url?: string;
    snapshot_filename?: string;
    cameraName?: string;
} 
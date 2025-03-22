export type AlertSeverity = 'low' | 'medium' | 'high' | 'info';

export interface Alert {
	id: number | string;
	title: string;
	location: string;
	timestamp: Date | string;
	severity: AlertSeverity;
	query: string;
	redirect_url?: string;
}

// Analytics data type
export type AnalyticsData = {
	attendance: {
		total: number;
		prevTotal: number;
		allTotal: number;
	};
	alerts: {
		count: number;
		prevCount: number;
	};
	cameras: {
		active: number;
		total: number;
	};
	teams: {
		team1: {
			name: string;
			color: string;
			fans: number;
			prevFans: number;
			allFans: number;
		};
		team2: {
			name: string;
			color: string;
			fans: number;
			prevFans: number;
			allFans: number;
		};
	};
};

export type AttendanceData = {
	times: string[];
	incoming: number[];
	// outgoing: number[];
};

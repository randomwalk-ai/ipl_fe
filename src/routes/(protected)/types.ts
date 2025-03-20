export type AlertSeverity = "low" | "medium" | "high" | "info";

export interface Alert {
	id: number;
	title: string;
	location: string;
	timestamp: Date;
	severity: AlertSeverity;
}

// Analytics data type
export type AnalyticsData = {
	attendance: {
		total: number;
		prevTotal: number;
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
		};
		team2: {
			name: string;
			color: string;
			fans: number;
			prevFans: number;
		};
	};
};

export type AttendanceData = {
	times: string[];
	incoming: number[];
	outgoing: number[];
};
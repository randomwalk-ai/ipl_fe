export type AlertSeverity = 'low' | 'medium' | 'high' | 'info';

interface Results {
	results: Result[]
	redirect_url: string
}

interface Result {
	id: string
	data: Data
	label: string
	zones: any[]
	camera: string
	img_url: string
	plus_id: any
	end_time: number
	has_clip: boolean
	sub_label: any
	thumbnail: string
	top_score: any
	start_time: number
	thumb_path: string
	has_snapshot: boolean
	search_source: string
	search_distance: number
}

interface Data {
	type: string
	score: number
	top_score: number,
	description?: string
}

export interface Alert {
	id: string
	alertId: string
	query: string
	results: Results
	createdAt: string
}

export type AnomalyType = {
	id: number;
	cameraId: number;
	createdAt: string;
	startFrame: number;
	endFrame: number;
	anomalyCount: number;
	filePath: string;
	camera: {
		id: number;
		name: string;
	};
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
	team1: number[];
	team2: number[];
};

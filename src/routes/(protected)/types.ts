export type AlertSeverity = 'low' | 'medium' | 'high' | 'info';

interface Results {
	results: Result[];
	redirect_url: string;
}

interface Result {
	id: string;
	data: Data;
	label: string;
	zones: any[];
	camera: string;
	img_url: string;
	plus_id: any;
	end_time: number;
	has_clip: boolean;
	sub_label: any;
	thumbnail: string;
	top_score: any;
	start_time: number;
	thumb_path: string;
	has_snapshot: boolean;
	search_source: string;
	search_distance: number;
}

interface Data {
	type: string;
	score: number;
	top_score: number;
	description?: string;
}

export interface Alert {
	id: string;
	alertId: string;
	query: string;
	results: Results;
	createdAt: string;
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
};

export type PoliceMonitoringType = {
	id: number;
	camera_id: string;
	missing_duration: number;
	from_timestamp: string;
	to_timestamp: string;
	clip_path: string;
	snapshot_path: string;
	created_at: string;
};

// cam-attendance data type
export interface Camera {
	camera_id: string;
	camera_name: string; // Added camera name
	max_unique_count: number;
	max_jersey_yellow: number;
	max_jersey_blue: number;
	max_jersey_others: number;
}

export interface CameraData {
	minute_bucket: string;
	cameras: Camera[];
}

export interface CamAttendanceType {
	cameraData: CameraData[];
	timestamp: string;
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

export type LoiteringData = {
	id: number;
	cameraId: string | null;
	status: string | null;
	updatedAt: string | null;
	eventId: string;
	zone: string | null;
	label: string | null;
	timestampEntry: string;
	timestampExit: string | null;
	durationSeconds: number | null;
	clipFilename: string | null;
	insertedAt: string | null;
};

export interface FrigateEventData {
	score: number;
	top_score: number;
	type: string;
	box?: number[];
	region?: number[];
	attributes?: {
		[key: string]: any;
	};
}

export interface FrigateEvent {
	id: string;
	camera: string;
	label: string;
	sub_label: any;
	zones: any[];
	start_time: number;
	end_time: number;
	has_clip: boolean;
	has_snapshot: boolean;
	top_score: any;
	plus_id: any;
	thumb_path: string;
	data: FrigateEventData;
	search_distance: number;
	search_source: string;
	source_instance: string;
	// Add any other relevant fields you expect
	[key: string]: any; // Allow for other potential fields
}

export type FrigateSearchResponse = FrigateEvent[];

export type CameraType = {
	id: number;
	name: string;
	category: string;
	url: string;
};

export type TweetsData = {
	tweetId: string;
	tweetUser: string;
	tweetDate: string;
	text: string;
	retweets: number;
	likes: number;
	category: string;
	sentiment: 'positive' | 'negative' | 'neutral';
	input: string;
};

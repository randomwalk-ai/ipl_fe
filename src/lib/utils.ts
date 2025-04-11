import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseUtcToIstTime(utcString: string): string {
	try {
		let utcDate = dayjs.utc(utcString);

		if (!utcDate.isValid()) {
			throw new Error(`Invalid UTC date string: ${utcString}`);
		}

		let istDate = utcDate.tz('Asia/Kolkata');
		// subtract 5.5 hours to convert UTC to IST
		// istDate = istDate.subtract(5.5, 'hour');

		// Use localized format 'LT' for time in en-US locale.
		return istDate.locale('en-US').format('LT');
	} catch (error) {
		console.error('Error parsing UTC to IST time:', error);
		return 'Invalid Time'; // Or handle appropriately
	}
}

// add 5.5 hours to convert UTC to IST
export function addHoursToDate(date: string) {
	try {
		let utcDate = dayjs.utc(date);

		if (!utcDate.isValid()) {
			throw new Error(`Invalid UTC date string: ${date}`);
		}

		let istDate = utcDate.add(5.5, 'hour');
		return istDate.locale('en-US').toString();
	} catch (error) {
		console.error('Error parsing UTC to IST time:', error);
		return 'Invalid Time'; // Or handle appropriately
	}
}

export function timeAgo(utcDateString: string | Date | null | undefined): string {
	if (!utcDateString) {
		return 'No date provided';
	}

	try {
		let date =
			typeof utcDateString === 'string' ? dayjs.utc(utcDateString) : dayjs.utc(utcDateString);

		if (!date.isValid()) {
			throw new Error(`Invalid date: ${utcDateString}`);
		}
		// subtract 5.5 hours to convert UTC to IST
		date = date.subtract(5.5, 'hour');
		return date.fromNow(); // Calculates relative to now (in UTC)
	} catch (error) {
		console.error('Error in timeAgoFromUtc:', error);
		return 'Invalid date';
	}
}

/**
 * Generates CSS style for an absolutely positioned bounding box.
 * Coordinates are assumed to be in pixels relative to the image.
 */
export function getBoundingBoxStyle(
	box: number[] | undefined | null,
	imageWidth: number,
	imageHeight: number
): string {
	// --- Input Validation ---
	if (!box || box.length !== 4) {
		// console.warn('getBoundingBoxStyle: Invalid box data received.');
		return 'display: none;'; // Hide the element if box data is bad
	}

	if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) {
		// console.warn('getBoundingBoxStyle: Invalid image dimensions received.', { imageWidth, imageHeight });
		return 'display: none;';
	}

	const [x_min, y_min, x_max, y_max] = box;

	// --- Basic Coordinate Validation (Optional but Recommended) ---
	if (x_min >= x_max || y_min >= y_max) {
		// console.warn('getBoundingBoxStyle: Invalid box coordinates (min >= max).', { box });
		return 'display: none;';
	}

	// --- Clamp coordinates to be within image bounds ---
	const safe_x_min = Math.max(0, x_min);
	const safe_y_min = Math.max(0, y_min);
	const safe_x_max = Math.min(imageWidth, x_max);
	const safe_y_max = Math.min(imageHeight, y_max);

	// --- Calculate Dimensions in Pixels ---
	const pixelWidth = safe_x_max - safe_x_min;
	const pixelHeight = safe_y_max - safe_y_min;

	// --- Final check for valid dimensions after clamping ---
	if (pixelWidth <= 0 || pixelHeight <= 0) {
		// console.warn('getBoundingBoxStyle: Calculated zero or negative dimensions.', { box, imageWidth, imageHeight, pixelWidth, pixelHeight });
		return 'display: none;';
	}

	// --- Calculate Percentage Values ---
	const leftPercent = (safe_x_min / imageWidth) * 100;
	const topPercent = (safe_y_min / imageHeight) * 100;
	const widthPercent = (pixelWidth / imageWidth) * 100;
	const heightPercent = (pixelHeight / imageHeight) * 100;

	// --- Construct CSS String ---
	return `
	position: absolute;
	left: ${leftPercent.toFixed(2)}%;
	top: ${topPercent.toFixed(2)}%;
	width: ${widthPercent.toFixed(2)}%;
	height: ${heightPercent.toFixed(2)}%;
	border: 1px solid red;
	box-sizing: border-box;
	box-shadow: 0 0 5px rgba(255, 0, 0, 0.7);
	pointer-events: none;
`;
}

export const formatDate = (dateString: string) => {
	try {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch (e) {
		return 'Invalid Date';
	}
};
// external_roadside - http://107.170.74.160:5010
// foodstalls_media - http://192.241.185.241:5010
// gallery_kmk_box - http://162.243.227.227:5010
// gate_concourse - http://162.243.75.102:5010
// hospitality_offices - http://107.170.123.140:5010
// stand_entry - http://107.170.54.225:5010

// export const frigateInstances = [
// 	{
// 		name: "Test", url: "http://localhost:5020", semanticUrl: "http://localhost:8089"
// 	},
// 	// { name: 'Stands Entry/Exit', url: 'https://162.243.212.38', semanticUrl: 'https://162.243.212.38:8089' },
// 	// { name: 'Media', url: 'https://68.183.197.229', semanticUrl: 'https://68.183.197.229:8089'},
// 	// { name: 'Hospitality Offices', url: 'https://107.170.59.75', semanticUrl: 'https://107.170.59.75:8089' },
// 	// { name: 'Concourse', url: 'https://138.197.135.188', semanticUrl: 'https://138.197.135.188:8089' }
// ];

export const frigateInstances = [
	{
		name: 'galleries', url: '107.170.8.107:5010', semanticUrl: "107.170.8.107:8089"
	},
	{
		name: 'external', url: '107.170.29.114:5010', semanticUrl: "107.170.29.114:8089"
	},
	{
		name: 'gate-concourse', url: '162.243.3.182:5010', semanticUrl: "162.243.3.182:8089"
	},
	{
		name: 'Hospitality', url: '162.243.248.150:5010', semanticUrl: "162.243.248.150:8089"
	},
	{
		name: 'Foodstalls', url: '162.243.253.121:5010', semanticUrl: "162.243.253.121:8089"
	},
	{
		name: 'ipl-frigate-6', url: '162.243.219.217:5010', semanticUrl: "162.243.219.217:8089"
	}
]

export const ipl_players_lookup: {
	[key: string]: string;
} = {
	'csk ashwin': 'Ravi Ashwin',
	'csk conway': 'Devon Conway',
	'csk curran': 'Sam Curran',
	'csk dhoni': 'MS Dhoni',
	'csk dube': 'Shivam Dube',
	'csk hooda': 'Deepak Hooda',
	'csk jadeja': 'Ravindra Jadeja',
	'csk khaleel': 'Khaleel Ahmed',
	'noor csk': 'Noor Ahmad',
	'csk pathirana': 'Matheesha Pathirana',
	'csk rachin ravindra': 'Rachin Ravindra',
	'rahul tripathi': 'Rahul Tripathi',
	'csk ruturaj gaikwad': 'Ruturaj Gaikwad'
};

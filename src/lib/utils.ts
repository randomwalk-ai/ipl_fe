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
// external_roadside - http://107.170.74.160:5010
// foodstalls_media - http://192.241.185.241:5010
// gallery_kmk_box - http://162.243.227.227:5010
// gate_concourse - http://162.243.75.102:5010
// hospitality_offices - http://107.170.123.140:5010
// stand_entry - http://107.170.54.225:5010

export const frigateInstances = [
	{ name: 'Stands Entry/Exit', url: 'http://107.170.54.225:5010' },
	{ name: 'Galleries', url: 'http://162.243.227.227:5010' },
	{ name: 'Gates & Concourse', url: 'http://162.243.75.102:5010' },
	{ name: 'External Road Cameras', url: 'http://107.170.74.160:5010' },
	{ name: 'Food Stalls & Media', url: 'http://192.241.185.241:5010' },
	{ name: 'Hospitality Offices', url: 'http://107.170.123.140:5010' }
];

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

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
		istDate = istDate.subtract(5.5, 'hour');

		// Use localized format 'LT' for time in en-US locale.
		return istDate.locale('en-US').format('LT');
	} catch (error) {
		console.error('Error parsing UTC to IST time:', error);
		return 'Invalid Time'; // Or handle appropriately
	}
}

// add 5.5 hours to convert UTC to IST
export function addHoursToDate(date: string){
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
		return "No date provided";
	}

	try {
		let date = typeof utcDateString === 'string' ? dayjs.utc(utcDateString) : dayjs.utc(utcDateString);


		if (!date.isValid()) {
			throw new Error(`Invalid date: ${utcDateString}`);
		}
		// subtract 5.5 hours to convert UTC to IST
		date = date.subtract(5.5, 'hour');
		return date.fromNow(); // Calculates relative to now (in UTC)

	} catch (error) {
		console.error("Error in timeAgoFromUtc:", error);
		return "Invalid date";
	}
}

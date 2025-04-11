import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_NOTIFICATION_SERVICE_ENDPOINT, PUBLIC_TELEGRAM_CHAT_ID } from '$env/static/public';

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const { image } = await request.json();

		if (!image) {
			return json({ success: false, error: 'No image data provided' }, { status: 400 });
		}

		// Convert base64 data URL to a blob
		const base64Data = image.split(',')[1];
		const binaryData = atob(base64Data);
		const array = new Uint8Array(binaryData.length);

		for (let i = 0; i < binaryData.length; i++) {
			array[i] = binaryData.charCodeAt(i);
		}

		const blob = new Blob([array], { type: 'image/png' });

		// Create FormData to send to the backend
		const formData = new FormData();
		formData.append('image', blob, 'alerts-snapshot.png');
		formData.append('chat_id', PUBLIC_TELEGRAM_CHAT_ID);

		// Send to your backend service
		const backendUrl = PUBLIC_NOTIFICATION_SERVICE_ENDPOINT;

		const response = await fetch(backendUrl, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Error from notification service:', errorText);
			return json(
				{ success: false, error: `Service responded with ${response.status}` },
				{ status: 500 }
			);
		}

		const result = await response.json();
		return json({ success: true, result });
	} catch (error) {
		console.error('Error sending alert image:', error);
		return json({ success: false, error: 'Failed to send alert image' }, { status: 500 });
	}
};

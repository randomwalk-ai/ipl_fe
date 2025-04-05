import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Add server.allowedHosts
	server: {
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'9467-183-82-32-232.ngrok-free.app',
			'2e0d-183-82-32-232.ngrok-free.app'
		]
	}
});

import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// if (!(locals.session && locals.user)) {
	// 	return redirect(302, '/login');
	// }
	return {
		user: locals.user
	};
};

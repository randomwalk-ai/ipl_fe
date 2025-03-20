import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!(locals.session && locals.user)) {
		return redirect(302, '/login');
	}
	console.log(locals.user);
	return {
		user: locals.user
	}
};
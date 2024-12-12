// server/api/emails.ts
export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	return await $fetch(config.public.API_URL);
});

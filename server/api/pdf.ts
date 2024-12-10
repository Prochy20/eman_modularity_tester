export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		const base64String = body.pdf;

		if (!base64String) {
			throw createError('Missing parameter "pdf".');
		}

		const pdfBuffer = Buffer.from(base64String, 'base64');

		event.node.res.setHeader('Content-Type', 'application/pdf');

		return pdfBuffer;
	} catch (error) {
		// Ošetření případných chyb
		event.node.res.statusCode = 500;
		return { error: 'Failed to process the PDF file.' };
	}
});

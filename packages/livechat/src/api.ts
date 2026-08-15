import { LivechatClientImpl } from '@rocket.chat/ddp-client';
import { parse } from 'query-string';

const host =
	window.SERVER_URL ?? parse(window.location.search).serverUrl ?? (process.env.NODE_ENV === 'development' ? 'https://chatbot-stg.charisma.digital' : null);
export const useSsl = Boolean((Array.isArray(host) ? host[0] : host)?.match(/^https:/));

export const Livechat = LivechatClientImpl.create(host.replace(/^http/, 'ws'));

Livechat.rest.use(async function (request, next) {
	try {
		return await next(...request);
	} catch (error) {
		if (error instanceof Response) {
			const e = await error.json();
			throw e;
		}

		throw error;
	}
});

const originalUploadFile = Livechat.uploadFile.bind(Livechat);

Livechat.uploadFile = (rid: string, file: File) =>
	originalUploadFile(rid, file).catch((error: unknown) => {
		const xhr =
			typeof XMLHttpRequest !== 'undefined' && error && typeof error === 'object' && 'target' in error
				? (error as ProgressEvent<XMLHttpRequest>).target
				: undefined;
		const status =
			(error && typeof error === 'object' && 'status' in error && Number((error as { status?: number }).status)) ||
			(error && typeof error === 'object' && 'statusCode' in error && Number((error as { statusCode?: number }).statusCode)) ||
			(xhr instanceof XMLHttpRequest ? xhr.status : undefined);

		if (status === 413 || status === 0 || (typeof ProgressEvent !== 'undefined' && error instanceof ProgressEvent)) {
			throw {
				status: status === 0 ? 413 : status ?? 413,
				statusCode: status === 0 ? 413 : status ?? 413,
				reason: 'error-payload-too-large',
				error: 'error-payload-too-large',
			};
		}

		throw error;
	});

const MB = 1024 * 1024;

const parseMaxSizeMb = (value: string | undefined, defaultMb: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed * MB : defaultMb * MB;
};

export const LIVECHAT_FILE_UPLOAD_CATEGORIES = {
	image: {
		mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'] as const,
		extensions: ['.jpeg', '.jpg', '.png'] as const,
		maxSize: parseMaxSizeMb(process.env.LIVECHAT_FILE_UPLOAD_IMAGE_MAX_SIZE_MB, 5),
	},
	excel: {
		mimeTypes: ['application/vnd.ms-excel'] as const,
		extensions: ['.xls'] as const,
		maxSize: parseMaxSizeMb(process.env.LIVECHAT_FILE_UPLOAD_EXCEL_MAX_SIZE_MB, 5),
	},
	video: {
		mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'] as const,
		extensions: ['.mp4', '.webm', '.ogg'] as const,
		maxSize: parseMaxSizeMb(process.env.LIVECHAT_FILE_UPLOAD_VIDEO_MAX_SIZE_MB, 20),
	},
};

export type LivechatFileUploadCategory = (typeof LIVECHAT_FILE_UPLOAD_CATEGORIES)[keyof typeof LIVECHAT_FILE_UPLOAD_CATEGORIES];

export const LIVECHAT_FILE_UPLOAD_MAX_SIZE = Math.max(
	...Object.values(LIVECHAT_FILE_UPLOAD_CATEGORIES).map(({ maxSize }) => maxSize),
);

const getFileExtension = (filename: string): string => {
	const match = /\.[^.]+$/i.exec(filename);
	return match ? match[0].toLowerCase() : '';
};

export const getLivechatFileUploadCategory = (
	filename: string,
	mimetype?: string,
): LivechatFileUploadCategory | undefined => {
	const mimeType = mimetype?.split(';')[0]?.trim().toLowerCase();
	const extension = getFileExtension(decodeURIComponent(filename));

	return Object.values(LIVECHAT_FILE_UPLOAD_CATEGORIES).find(
		({ mimeTypes, extensions }) =>
			(mimeType && (mimeTypes as readonly string[]).includes(mimeType)) ||
			(extension && (extensions as readonly string[]).includes(extension)),
	);
};

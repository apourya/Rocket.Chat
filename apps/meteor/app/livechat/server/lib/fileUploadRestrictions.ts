const MB = 1024 * 1024;

export const LIVECHAT_FILE_UPLOAD_CATEGORIES = {
	image: {
		mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
		extensions: ['.jpeg', '.jpg', '.png'],
		maxSize: 5 * MB,
	},
	excel: {
		mimeTypes: ['application/vnd.ms-excel'],
		extensions: ['.xls'],
		maxSize: 5 * MB,
	},
	video: {
		mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
		extensions: ['.mp4', '.webm', '.ogg'],
		maxSize: 20 * MB,
	},
} as const;

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

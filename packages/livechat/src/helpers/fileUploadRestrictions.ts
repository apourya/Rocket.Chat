const MB = 1024 * 1024;

const parseMaxSizeMb = (value: string | undefined, defaultMb: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed * MB : defaultMb * MB;
};

export const FILE_UPLOAD_CATEGORIES = {
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

export type FileUploadCategory = (typeof FILE_UPLOAD_CATEGORIES)[keyof typeof FILE_UPLOAD_CATEGORIES];

export const ALLOWED_UPLOAD_ACCEPT = Object.values(FILE_UPLOAD_CATEGORIES)
	.flatMap(({ mimeTypes, extensions }) => [...mimeTypes, ...extensions])
	.join(',');

const getFileExtension = (filename: string): string => {
	const match = /\.[^.]+$/i.exec(filename);
	return match ? match[0].toLowerCase() : '';
};

export const formatUploadSizeLimit = (bytes: number): string => {
	const sizeInMb = bytes / MB;
	return Number.isInteger(sizeInMb) ? `${sizeInMb} MB` : `${sizeInMb.toFixed(1)} MB`;
};

export const getFileUploadCategory = (file: Pick<File, 'name' | 'type'>): FileUploadCategory | undefined => {
	const mimeType = file.type?.split(';')[0]?.trim().toLowerCase();
	const extension = getFileExtension(file.name);

	return Object.values(FILE_UPLOAD_CATEGORIES).find(
		({ mimeTypes, extensions }) =>
			(mimeType && (mimeTypes as readonly string[]).includes(mimeType)) ||
			(extension && (extensions as readonly string[]).includes(extension)),
	);
};

export type FileUploadValidationResult =
	| { ok: true; category: FileUploadCategory }
	| { ok: false; reason: 'error-type-not-allowed' | 'error-size-not-allowed'; sizeAllowed?: string };

export const validateUploadFile = (file: Pick<File, 'name' | 'type' | 'size'>): FileUploadValidationResult => {
	const category = getFileUploadCategory(file);

	if (!category) {
		return { ok: false, reason: 'error-type-not-allowed' };
	}

	if (file.size > category.maxSize) {
		return {
			ok: false,
			reason: 'error-size-not-allowed',
			sizeAllowed: formatUploadSizeLimit(category.maxSize),
		};
	}

	return { ok: true, category };
};

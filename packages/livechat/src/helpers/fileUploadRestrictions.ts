const MB = 1024 * 1024;

export const FILE_UPLOAD_CATEGORIES = {
	image: {
		mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
		extensions: ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
		maxSize: 5 * MB,
	},
	pdf: {
		mimeTypes: ['application/pdf'],
		extensions: ['.pdf'],
		maxSize: 5 * MB,
	},
	excel: {
		mimeTypes: [
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'text/csv',
		],
		extensions: ['.xls', '.xlsx', '.csv'],
		maxSize: 5 * MB,
	},
	video: {
		mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
		extensions: ['.mp4', '.webm', '.ogg'],
		maxSize: 20 * MB,
	},
} as const;

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
	const mimeType = file.type?.toLowerCase();
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

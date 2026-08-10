import { LivechatVisitors, LivechatRooms } from '@rocket.chat/models';
import filesize from 'filesize';

import { API } from '../../../../api/server';
import { getUploadFormData } from '../../../../api/server/lib/getUploadFormData';
import { FileUpload } from '../../../../file-upload/server';
import { settings } from '../../../../settings/server';
import { getLivechatFileUploadCategory, LIVECHAT_FILE_UPLOAD_MAX_SIZE } from '../../../server/lib/fileUploadRestrictions';
import { sendFileLivechatMessage } from '../../../server/methods/sendFileLivechatMessage';

API.v1.addRoute('livechat/upload/:rid', {
	async post() {
		if (!this.request.headers.get('x-visitor-token')) {
			return API.v1.forbidden();
		}

		const canUpload = settings.get<boolean>('Livechat_fileupload_enabled') && settings.get<boolean>('FileUpload_Enabled');

		if (!canUpload) {
			return API.v1.failure({
				reason: 'error-file-upload-disabled',
			});
		}

		const visitorToken = this.request.headers.get('x-visitor-token');
		const visitor = await LivechatVisitors.getVisitorByToken(visitorToken as string, {});

		if (!visitor) {
			return API.v1.forbidden();
		}

		const room = await LivechatRooms.findOneOpenByRoomIdAndVisitorToken(this.urlParams.rid, visitorToken as string);
		if (!room) {
			return API.v1.forbidden();
		}

		const settingsMaxFileSize = settings.get<number>('FileUpload_MaxFileSize') || 104857600;
		const maxFileSize =
			settingsMaxFileSize > -1 ? Math.min(settingsMaxFileSize, LIVECHAT_FILE_UPLOAD_MAX_SIZE) : LIVECHAT_FILE_UPLOAD_MAX_SIZE;

		const file = await getUploadFormData(
			{
				request: this.request,
			},
			{ field: 'file', sizeLimit: maxFileSize },
		);

		const { fields, fileBuffer, filename, mimetype } = file;

		const category = getLivechatFileUploadCategory(filename, mimetype);
		if (!category) {
			return API.v1.failure({
				reason: 'error-type-not-allowed',
			});
		}

		const buffLength = fileBuffer.length;

		if (buffLength > category.maxSize) {
			return API.v1.failure({
				reason: 'error-size-not-allowed',
				sizeAllowed: filesize(category.maxSize),
			});
		}

		const fileStore = FileUpload.getStore('Uploads');

		const details = {
			name: filename,
			size: buffLength,
			type: mimetype,
			rid: this.urlParams.rid,
			visitorToken,
		};

		const uploadedFile = await fileStore.insert(details, fileBuffer);
		if (!uploadedFile) {
			return API.v1.failure('Invalid file');
		}

		uploadedFile.description = fields.description;

		delete fields.description;
		return API.v1.success(await sendFileLivechatMessage({ roomId: this.urlParams.rid, visitorToken, file: uploadedFile, msgData: fields }));
	},
});

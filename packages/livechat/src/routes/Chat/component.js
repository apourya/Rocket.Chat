import { Component, createRef } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import { withTranslation } from 'react-i18next';

import styles from './styles.scss';
import { Button } from '../../components/Button';
import { CallIframe } from '../../components/Calls/CallIFrame';
import { default as CallNotification } from '../../components/Calls/CallNotification';
import { CallStatus } from '../../components/Calls/CallStatus';
import { Composer, ComposerAction, ComposerActions } from '../../components/Composer';
import { FilesDropTarget } from '../../components/FilesDropTarget';
import { FooterOptions, CharCounter } from '../../components/Footer';
import { Menu } from '../../components/Menu';
import { MessageList } from '../../components/Messages';
import { Screen } from '../../components/Screen';
import { createClassName } from '../../helpers/createClassName';
import { ALLOWED_UPLOAD_ACCEPT } from '../../helpers/fileUploadRestrictions';
import ChangeIcon from '../../icons/change.svg';
import FinishIcon from '../../icons/finish.svg';
import SendIcon from '../../icons/send.svg';
import RemoveIcon from '../../icons/remove.svg';
import AttachmentIcon from '../../icons/attachment.svg';
import EmojiIcon from '../../icons/smile.svg';
import { WelcomeScreen } from './WelcomeScreen'
import store from "../../store";

import 'emoji-mart/css/emoji-mart.css';
import { parse } from 'query-string';

const Picker = lazy(async () => {
	const { Picker } = await import('emoji-mart');
	return Picker;
});

const host =
	window.SERVER_URL ?? parse(window.location.search).serverUrl ?? (process.env.NODE_ENV === 'development' ? 'https://chatbot-stg.charisma.digital' : null);

const SUPPORT_REQUESTED_STORAGE_PREFIX = 'livechat_support_requested_';

const getSupportRequestedStorageKey = (roomId, token) => `${SUPPORT_REQUESTED_STORAGE_PREFIX}${roomId || token || 'default'}`;

const isSupportRequestedStored = (roomId, token) => {
	try {
		return window.localStorage.getItem(getSupportRequestedStorageKey(roomId, token)) === 'true';
	} catch {
		return false;
	}
};

const setSupportRequestedStored = (roomId, token) => {
	try {
		window.localStorage.setItem(getSupportRequestedStorageKey(roomId, token), 'true');
	} catch {
	}
};

class Chat extends Component {
	state = {
		atBottom: true,
		text: '',
		emojiPickerActive: false,
		showFeedback: false,
		hoveredStar: 0,
		selectedRating: 0,
		supportClickPending: false,
	};

	hasSupportBeenRequested = (messages = [], uid, supportText, roomId, token) => {
		if (isSupportRequestedStored(roomId, token)) {
			return true;
		}

		return messages.some((message) => message?.msg === supportText && (!uid || message?.u?._id === uid));
	};

	handleSupportClick = async (supportText) => {
		const { messages = [], uid, room, token } = this.props;
		const roomId = room?._id;

		if (this.state.supportClickPending || this.hasSupportBeenRequested(messages, uid, supportText, roomId, token)) {
			return;
		}

		this.setState({ supportClickPending: true });

		const success = await this.handleSubmit(supportText);

		if (!success) {
			this.setState({ supportClickPending: false });
		}
	};

	inputRef = createRef(null);

	handleFilesDropTargetRef = (ref) => {
		this.filesDropTarget = ref;
	};

	handleMessagesContainerRef = (messagesContainer) => {
		this.messagesContainer = messagesContainer ? messagesContainer.base : null;
	};

	handleScrollTo = (region) => {
		const { onTop, onBottom } = this.props;

		if (region === MessageList.SCROLL_AT_BOTTOM) {
			this.setState({ atBottom: true });
			onBottom && onBottom();
			return;
		}

		this.setState({ atBottom: false });

		if (region === MessageList.SCROLL_AT_TOP) {
			onTop && onTop();
		}
	};

	handleUploadClick = (event) => {
		event.preventDefault();
		this.inputRef?.current?.click();
	};

	handleSendClick = (event) => {
		event.preventDefault();
		this.handleSubmit(this.state.text);
	};

	handleSubmit = async (text) => {
	
		const success = (await this.props.onSubmit?.(text)) !== false;

		if (success) {
			this.setState({ text: '' });
			this.turnOffEmojiPicker();
		}

		return success;
	};

	handleChangeText = (text) => {
		let value = text;
		const { onChangeText, limitTextLength } = this.props;
		if (limitTextLength && limitTextLength < text.length) {
			value = value.substring(0, limitTextLength);
		}
		this.setState({ text: value });
		onChangeText && onChangeText(value);
	};

	toggleEmojiPickerState = () => {
		this.setState({ emojiPickerActive: !this.state.emojiPickerActive });
	};

	handleEmojiSelect = (emoji) => {
		this.toggleEmojiPickerState();
		this.notifyEmojiSelect(emoji.native);
	};

	handleEmojiClick = () => {
		this.turnOffEmojiPicker();
	};

	turnOffEmojiPicker = () => {
		if (this.state.emojiPickerActive) {
			this.setState({ emojiPickerActive: !this.state.emojiPickerActive });
		}
	};



	handleFeedback = (rating) => {
		this.sendFeedbackToServer(rating);
		this.setState({ showFeedback: false });
	};

	sendFeedbackToServer = (rating) => {
		const { user: _id, token, user } = store.state;
		const { room } = this.props;

		fetch(`${host}/api/v1/livechat/room.survey`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				rid: room._id,
				token, // visitor token
				data: [
					{
						name: "additionalFeedback",
						value: `Feedback from userId: ${_id}`,
					},
					{
						name: "rating",
						value: rating,
					},
				],
			}),
		})
			.then((res) => console.log("feedback res", res))
			.catch((err) => console.log("feedback err", err));
	};

	// onForwardToCrm = () => {
	// 	const { user: _id, token } = store.state;
	// 	const { room } = this.props;
	// 	fetch(
	// 		`${host}/api/v1/forward_room_to_crm?room_id=${room._id}&user_token=${token}`,
	// 		{
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 		}
	// 	)
	// 		.then((res) => console.log("forward_room_to_crm res", res))
	// 		.catch((err) => console.log("forward_room_to_crm err", err));
	// };

	componentDidUpdate() {
		const { messages = [], uid, t, room, token } = this.props;
		const supportText = t('support');
		const roomId = room?._id;
		const supportRequested = this.hasSupportBeenRequested(messages, uid, supportText, roomId, token);

		if (supportRequested) {
			setSupportRequestedStored(roomId, token);
		}

		if (this.state.supportClickPending && supportRequested) {
			this.setState({ supportClickPending: false });
		}
	}

	render = (
		{
			title,
			uid,
			agent,
			typingUsernames,
			avatarResolver,
			conversationFinishedMessage,
			loading,
			onUpload,
			messages,
			uploads = false,
			options,
			onChangeDepartment,
			onFinishChat,
			onRemoveUserData,
			lastReadMessageId,
			queueInfo,
			registrationRequired,
			onRegisterUser,
			limitTextLength,
			t,
			incomingCallAlert,
			ongoingCall,
			dispatch,
			theme,
			...props
		},
		{ atBottom = true, text, supportClickPending },
	) => {
		const supportText = t('support');
		const supportDisabled =
			supportClickPending || this.hasSupportBeenRequested(messages, uid, supportText, props.room?._id, props.token);

		return (
		<Screen
			title={title || t('need_help')}
			agent={agent || null}
			queueInfo={queueInfo}
			nopadding
			onChangeDepartment={onChangeDepartment}
			onFinishChat={onFinishChat}
			onRemoveUserData={onRemoveUserData}
			className={createClassName(styles, 'chat')}
			handleEmojiClick={this.handleEmojiClick}
			theme={theme}
			supportDisabled={supportDisabled}
			onSupportClick={() => this.handleSupportClick(supportText)}
			{...props}
		>
			<FilesDropTarget
				inputRef={this.inputRef}
				overlayed
				overlayText={t('drop_here_to_upload_a_file')}
				accept={ALLOWED_UPLOAD_ACCEPT}
				onUpload={onUpload}
			>
				<Screen.Content nopadding>
					{incomingCallAlert && !!incomingCallAlert.show && <CallNotification {...incomingCallAlert} dispatch={dispatch} />}
					{incomingCallAlert?.show && ongoingCall && ongoingCall.callStatus === CallStatus.IN_PROGRESS_SAME_TAB ? (
						<CallIframe {...incomingCallAlert} />
					) : null}
					{messages.length === 0 && <WelcomeScreen onSelectSuggestion={this.handleSubmit} />}
					<div className={createClassName(styles, 'chat__messages', { atBottom, loading })}>
						<MessageList
							ref={this.handleMessagesContainerRef}
							avatarResolver={avatarResolver}
							uid={uid}
							messages={messages}
							typingUsernames={typingUsernames}
							conversationFinishedMessage={conversationFinishedMessage}
							lastReadMessageId={lastReadMessageId}
							handleEmojiClick={this.handleEmojiClick}
							dispatch={dispatch}
							hideSenderAvatar={theme?.hideGuestAvatar}
							hideReceiverAvatar={theme?.hideAgentAvatar}
							onScrollTo={this.handleScrollTo}
						/>
						{this.state.emojiPickerActive && (
							<Suspense fallback={null}>
								<Picker
									style={{ position: 'absolute', zIndex: 10, bottom: 0, maxWidth: '90%', left: 20, maxHeight: '90%' }}
									showPreview={false}
									showSkinTones={false}
									sheetSize={64}
									onSelect={this.handleEmojiSelect}
									autoFocus={true}
								/>
							</Suspense>
						)}
					</div>
				</Screen.Content>


				<Screen.Footer
					// options={
					// 	options && !registrationRequired ? (
					// 		<FooterOptions>
					// 			<Menu.Group>
					// 				{onChangeDepartment && (
					// 					<Menu.Item onClick={onChangeDepartment} icon={ChangeIcon}>
					// 						{t('change_department')}
					// 					</Menu.Item>
					// 				)}
					// 				{onRemoveUserData && (
					// 					<Menu.Item onClick={onRemoveUserData} icon={RemoveIcon}>
					// 						{t('forget_remove_my_data')}
					// 					</Menu.Item>
					// 				)}
					// 				{onFinishChat && (
					// 					<Menu.Item danger onClick={onFinishChat} icon={FinishIcon}>
					// 						{t('finish_this_chat')}
					// 					</Menu.Item>
					// 				)}
					// 			</Menu.Group>
					// 		</FooterOptions>
					// 	) : null
					// }
					limit={limitTextLength ? <CharCounter limitTextLength={limitTextLength} textLength={text.length} /> : null}
				>
					{registrationRequired ? (
						<Button loading={loading} disabled={loading} onClick={onRegisterUser} stack>
							{t('chat_now')}
						</Button>
					) : (

						<Composer
							onUpload={onUpload}
							onSubmit={this.handleSubmit}
							onChange={this.handleChangeText}
							placeholder={'پیام خود را بنویسید ...'}
							value={text}
							notifyEmojiSelect={(click) => {
								this.notifyEmojiSelect = click;
							}}
							inputLock={typingUsernames && typingUsernames.length ? true : false}
							handleEmojiClick={this.handleEmojiClick}
							pre={
								<ComposerActions>
									<ComposerAction onClick={this.handleUploadClick} ghost>
										<AttachmentIcon width={24} height={24} />
									</ComposerAction>
								</ComposerActions>
							}
							post={
								<ComposerAction onClick={this.handleSendClick} disabled={text.length === 0 || loading} >
									<SendIcon/>
								</ComposerAction>

							}
							limitTextLength={limitTextLength}
						/>
					)}
				</Screen.Footer>
			</FilesDropTarget>
		</Screen>
		);
	};
}

export default withTranslation()(Chat);

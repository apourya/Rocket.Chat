import { parseISO, isSameDay } from 'date-fns';
import { Suspense } from 'preact/compat';

import { MemoizedComponent } from '../../../helpers/MemoizedComponent';
import { getAttachmentUrl } from '../../../helpers/baseUrl';
import { createClassName } from '../../../helpers/createClassName';
import constants from '../../../lib/constants';
import store from '../../../store';
import { isCallOngoing } from '../../Calls/CallStatus';
import { JoinCallButton } from '../../Calls/JoinCallButton';
import Message from '../Message';
import MessageSeparator from '../MessageSeparator';
import { TypingIndicator } from '../TypingIndicator';
import styles from './styles.scss';

export class MessageList extends MemoizedComponent {
	static defaultProps = {
		typingUsernames: [],
	};

	static SCROLL_AT_TOP = 'top';

	static SCROLL_AT_BOTTOM = 'bottom';

	static SCROLL_FREE = 'free';

	static SCROLL_AT_BOTTOM_AREA = 128;

	static SCROLL_MESSAGE_TOP_OFFSET = 24;

	// eslint-disable-next-line no-use-before-define
	scrollPosition = MessageList.SCROLL_AT_BOTTOM;

	findMessageElement = (messageId) => {
		if (!this.content || !messageId) {
			return null;
		}

		const element = document.getElementById(messageId);

		if (!element || !this.content.contains(element)) {
			return null;
		}

		return element;
	};

	getLastMessageId = () => {
		const { messages } = this.props;

		if (!messages?.length) {
			return null;
		}

		return messages[messages.length - 1]._id;
	};

	scrollToLatestMessage = (messageId) => {
		if (!this.base) {
			return;
		}

		const id = messageId || this.pinnedMessageId || this.getLastMessageId();
		const messageElement = this.findMessageElement(id);

		if (!messageElement) {
			return;
		}

		const containerTop = this.base.getBoundingClientRect().top;
		const messageTop = messageElement.getBoundingClientRect().top;
		this.base.scrollTop = Math.max(
			0,
			this.base.scrollTop + messageTop - containerTop - MessageList.SCROLL_MESSAGE_TOP_OFFSET,
		);
		this.pinnedMessageId = id;
		this.isProgrammaticScroll = true;
	};

	scheduleScrollToLatestMessage = (messageId) => {
		if (this.scrollToBottomFrame) {
			cancelAnimationFrame(this.scrollToBottomFrame);
		}

		const id = messageId || this.pinnedMessageId || this.getLastMessageId();

		this.scrollToBottomFrame = requestAnimationFrame(() => {
			this.scrollToLatestMessage(id);
			this.scrollToBottomFrame = requestAnimationFrame(() => {
				this.scrollToLatestMessage(id);
				delete this.scrollToBottomFrame;
			});
		});
	};

	setContentRef = (element) => {
		this.content = element;

		if (this.contentResizeObserver) {
			this.contentResizeObserver.disconnect();
		}

		if (!element || typeof ResizeObserver === 'undefined') {
			return;
		}

		if (!this.contentResizeObserver) {
			this.contentResizeObserver = new ResizeObserver(() => {
				this.handleContentResize();
			});
		}

		this.contentResizeObserver.observe(element);
	};

	handleContentResize = () => {
		if (this.scrollPosition === MessageList.SCROLL_AT_BOTTOM) {
			this.scrollToLatestMessage(this.pinnedMessageId);
		}
	};

	handleScroll = () => {
		if (this.isProgrammaticScroll) {
			this.scrollToLatestMessage(this.pinnedMessageId);
			delete this.isProgrammaticScroll;
			return;
		}

		let scrollPosition;
		const scrollBottom = this.base.scrollHeight - (this.base.clientHeight + this.base.scrollTop);

		if (this.base.scrollHeight <= this.base.clientHeight) {
			scrollPosition = MessageList.SCROLL_AT_BOTTOM;
		} else if (this.base.scrollTop === 0) {
			scrollPosition = MessageList.SCROLL_AT_TOP;
		} else if (scrollBottom <= MessageList.SCROLL_AT_BOTTOM_AREA) {
			// TODO: Once we convert these classes to functional components we should use refs to check if the last message is within the viewport
			// For now we are using a fixed value to check if the last message is within the bottom of the scroll area
			scrollPosition = MessageList.SCROLL_AT_BOTTOM;
		} else {
			scrollPosition = MessageList.SCROLL_FREE;
		}

		if (scrollPosition === MessageList.SCROLL_FREE) {
			delete this.pinnedMessageId;
		}

		if (this.scrollPosition !== scrollPosition) {
			this.scrollPosition = scrollPosition;
			const { onScrollTo } = this.props;
			onScrollTo && onScrollTo(scrollPosition);
		}

		const { dispatch } = this.props;
		const { messageListPosition } = store.state;

		if (messageListPosition !== this.scrollPosition) {
			dispatch({ messageListPosition: this.scrollPosition });
		}
	};

	handleResize = () => {
		if (!this.base) {
			return;
		}

		const clientHeight = this.base.clientHeight;
		const wasCollapsed = !this.previousClientHeight;
		const nowExpanded = clientHeight > 0;
		this.previousClientHeight = clientHeight;

		if (wasCollapsed && nowExpanded) {
			this.scrollPosition = MessageList.SCROLL_AT_BOTTOM;
			const lastMessageId = this.getLastMessageId();

			if (lastMessageId) {
				this.pinnedMessageId = lastMessageId;
			}

			const { onScrollTo, dispatch } = this.props;
			onScrollTo && onScrollTo(MessageList.SCROLL_AT_BOTTOM);
			if (dispatch) {
				dispatch({ messageListPosition: MessageList.SCROLL_AT_BOTTOM });
			}
		}

		if (this.scrollPosition === MessageList.SCROLL_AT_BOTTOM) {
			this.scheduleScrollToLatestMessage(this.pinnedMessageId);
			return;
		}

		if (this.base.scrollHeight <= this.base.clientHeight) {
			const { onScrollTo } = this.props;
			this.scrollPosition = MessageList.SCROLL_AT_BOTTOM;
			onScrollTo && onScrollTo(MessageList.SCROLL_AT_BOTTOM);
		}
	};

	handleClick = () => {
		const { handleEmojiClick } = this.props;
		handleEmojiClick && handleEmojiClick();
	};

	componentWillUpdate() {
		if (this.scrollPosition === MessageList.SCROLL_AT_TOP) {
			this.previousScrollHeight = this.base.scrollHeight;
		}
	}

	componentDidUpdate(prevProps) {
		const { messages, uid } = this.props;
		const { messages: prevMessages } = prevProps;
		const lastMessage = messages?.[messages.length - 1];

		if (messages?.length && !prevMessages?.length && lastMessage?._id) {
			this.pinnedMessageId = lastMessage._id;
			this.scrollPosition = MessageList.SCROLL_AT_BOTTOM;
			this.scheduleScrollToLatestMessage(lastMessage._id);
			return;
		}

		if (messages?.length !== prevMessages?.length) {
			if (lastMessage?.u?._id && lastMessage.u._id === uid) {
				this.scrollPosition = MessageList.SCROLL_AT_BOTTOM;
			}

			if (this.scrollPosition === MessageList.SCROLL_AT_BOTTOM && lastMessage?._id) {
				this.pinnedMessageId = lastMessage._id;
				this.scheduleScrollToLatestMessage(lastMessage._id);
				return;
			}
		}

		if (this.scrollPosition === MessageList.SCROLL_AT_TOP) {
			const delta = this.base.scrollHeight - this.previousScrollHeight;
			if (delta > 0) {
				this.base.scrollTop = delta;
			}
			delete this.previousScrollHeight;
		}
	}

	componentDidMount() {
		const lastMessageId = this.getLastMessageId();

		if (lastMessageId) {
			this.pinnedMessageId = lastMessageId;
			this.scrollPosition = MessageList.SCROLL_AT_BOTTOM;
			this.scheduleScrollToLatestMessage(lastMessageId);
		}

		this.handleResize();
		window.addEventListener('resize', this.handleResize);

		if (typeof ResizeObserver !== 'undefined' && this.base) {
			this.resizeObserver = new ResizeObserver(() => {
				this.handleResize();
			});
			this.resizeObserver.observe(this.base);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
		this.resizeObserver?.disconnect();
		this.contentResizeObserver?.disconnect();

		if (this.scrollToBottomFrame) {
			cancelAnimationFrame(this.scrollToBottomFrame);
		}
	}

	isVideoConfMessage(message) {
		return Boolean(
			message.blocks
				?.find(({ appId, type }) => appId === 'videoconf-core' && type === 'actions')
				?.elements?.find(({ actionId }) => actionId === 'joinLivechat'),
		);
	}

	renderItems = ({
		attachmentResolver = getAttachmentUrl,
		avatarResolver,
		messages,
		lastReadMessageId,
		uid,
		conversationFinishedMessage,
		typingUsernames,
	}) => {
		const items = [];
		const { incomingCallAlert, ongoingCall } = store.state;
		const { hideSenderAvatar = false, hideReceiverAvatar = false } = this.props || {};

		for (let i = 0; i < messages.length; ++i) {
			const previousMessage = messages[i - 1];
			const message = messages[i];
			const nextMessage = messages[i + 1];

			if (
				message.t === constants.webRTCCallStartedMessageType &&
				message.actionLinks &&
				message.actionLinks.length &&
				ongoingCall &&
				isCallOngoing(ongoingCall.callStatus) &&
				!message.webRtcCallEndTs
			) {
				const { url, callProvider, rid } = incomingCallAlert || {};
				items.push(<JoinCallButton callStatus={ongoingCall.callStatus} url={url} callProvider={callProvider} rid={rid} />);
				continue;
			}

			const videoConfJoinBlock = message.blocks
				?.find(({ appId, type }) => appId === 'videoconf-core' && type === 'actions')
				?.elements?.find(({ actionId }) => actionId === 'joinLivechat');
			if (videoConfJoinBlock) {
				// If the call is not accepted yet, don't render the message.
				if (!ongoingCall || !isCallOngoing(ongoingCall.callStatus)) {
					continue;
				}
			}

			const showDateSeparator = !previousMessage || !isSameDay(parseISO(message.ts), parseISO(previousMessage.ts));
			if (showDateSeparator) {
				items.push(<MessageSeparator key={`sep-${message.ts}`} use='li' date={message.ts} />);
			}

			const isMe = uid && message.u && uid === message.u._id;
			items.push(
				<Suspense fallback={null}>
					<Message
						key={message._id}
						attachmentResolver={attachmentResolver}
						avatarResolver={avatarResolver}
						use='li'
						me={isMe}
						hideAvatar
						compact={nextMessage && message.u && nextMessage.u && message.u._id === nextMessage.u._id && !nextMessage.t}
						conversationFinishedMessage={conversationFinishedMessage}
						type={message.t}
						{...message}
					/>
				</Suspense>,
			);

			const showUnreadSeparator = lastReadMessageId && nextMessage && lastReadMessageId === message._id;
			if (showUnreadSeparator) {
				items.push(<MessageSeparator key='unread' use='li' unread />);
			}
		}

		if (typingUsernames && typingUsernames.length) {
			items.push(<TypingIndicator key='typing' use='li' avatarResolver={avatarResolver} usernames={typingUsernames}  />);
		}

		return items;
	};

	render = ({ className, style = {} }) => (
		<div
			onScroll={this.handleScroll}
			className={createClassName(styles, 'message-list', {}, [className])}
			onClick={this.handleClick}
			style={style}
			data-qa='message-list'
		>
			<ol ref={this.setContentRef} className={createClassName(styles, 'message-list__content')}>
				{this.renderItems(this.props)}
			</ol>
		</div>
	);
}

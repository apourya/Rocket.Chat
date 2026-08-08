import { memo } from 'preact/compat';
import { MessageBubble } from '../MessageBubble';
import { MessageContainer } from '../MessageContainer';
import { MessageContent } from '../MessageContent';
import { TypingDots } from '../TypingDots';

type TypingIndicatorProps = {
	avatarResolver: (username: string) => string | undefined;
	usernames?: string[];
	text: string;
};

export const TypingIndicator = memo(({ avatarResolver, usernames = [], text, ...containerProps }: TypingIndicatorProps) => (
	<MessageContainer {...containerProps} reverse>
		<MessageContent autoWidth>
			<MessageBubble style={{ paddingInline: '14px', paddingBlock: '12px' }}>
				<TypingDots text={text} />
			</MessageBubble>
		</MessageContent>
	</MessageContainer>
));

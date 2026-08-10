import type { ComponentChildren } from 'preact';
import type { CSSProperties } from 'preact/compat';
import { memo } from 'preact/compat';

import styles from './styles.scss';
import { createClassName } from '../../../helpers/createClassName';

type MessageContentProps = {
	reverse?: boolean;
	autoWidth?: boolean;
	system?: boolean;
	className?: string;
	style?: CSSProperties;
	children?: ComponentChildren;
};

export const MessageContent = memo(({ reverse, autoWidth, system, className, style = {}, children }: MessageContentProps) => (
	<div className={createClassName(styles, 'message-content', { reverse, 'auto-width': autoWidth, system }, [className])} style={style}>
		{children}
	</div>
));

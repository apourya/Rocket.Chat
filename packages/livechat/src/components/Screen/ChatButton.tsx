import ChatIcon from '../../icons/chat.svg';
import ArrowIcon from '../../icons/arrowDown.svg';
import { Button } from '../Button';
import { useEffect, useState } from 'react';

type ChatButtonProps = {
	text: string;
	minimized: boolean;
	badge: number;
	onClick: () => void;
	triggered?: boolean;
	className?: string;
	logoUrl?: string;
};

export const ChatButton = ({ text, minimized, badge, onClick, triggered = false, className, logoUrl }: ChatButtonProps) => {
	const [isMobile, setIsMobile] = useState(
		typeof window !== 'undefined' ? window.outerWidth < 768 : false
	);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.outerWidth < 768);

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);


	if (!minimized && isMobile) {
		return null;
	}
	const openIcon = logoUrl ? <img src={logoUrl} width={24} height={24} alt='Livechat' /> : <ChatIcon width={24} height={24} />;

	return (
		<Button
			icon={minimized || triggered ? openIcon : <ArrowIcon width={24} height={24} />}
			badge={badge}
			primary
			onClick={onClick}
			className={className}
			data-qa-id='chat-button'
		>
			{text}
		</Button>
	);
};

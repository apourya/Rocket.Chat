import { useState, useEffect } from 'preact/hooks';
import WelcomeImage from '../../assets/images/welcome.png';
import styles from './welcomeStyles.scss';
import { createClassName } from '../../helpers/createClassName';
import { Button } from '../../components/Button';

const FAQ_API_URL =
	process.env.NODE_ENV === 'development'
		? 'https://chatbotai-stg.charisma.digital/api/faq'
		: 'https://chatbotai.charisma.ir/api/faq';

type FaqItem = {
	question?: string;
	title?: string;
	text?: string;
	q?: string;
};

type WelcomeScreenProps = {
	onSelectSuggestion: (text: string) => void;
};

const extractQuestions = (payload: unknown): string[] => {
	const list = Array.isArray(payload)
		? payload
		: payload && typeof payload === 'object'
			? (payload as { data?: unknown; faqs?: unknown; results?: unknown; items?: unknown }).data ??
				(payload as { faqs?: unknown }).faqs ??
				(payload as { results?: unknown }).results ??
				(payload as { items?: unknown }).items
			: null;

	if (!Array.isArray(list)) {
		return [];
	}

	return list
		.map((item) => {
			if (typeof item === 'string') {
				return item.trim();
			}
			if (item && typeof item === 'object') {
				const faq = item as FaqItem;
				return (faq.question ?? faq.title ?? faq.text ?? faq.q ?? '').trim();
			}
			return '';
		})
		.filter(Boolean);
};

export function WelcomeScreen({ onSelectSuggestion }: WelcomeScreenProps) {
	const [currentTime, setCurrentTime] = useState('');
	const [suggestions, setSuggestions] = useState<string[]>([]);

	useEffect(() => {
		const now = new Date();
		const timeString = now.toLocaleTimeString('fa-IR', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});
		setCurrentTime(timeString);
	}, []);

	useEffect(() => {
		const controller = new AbortController();

		const loadSuggestions = async () => {
			try {
				const response = await fetch(FAQ_API_URL, {
					method: 'GET',
					headers: { Accept: 'application/json' },
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error(`FAQ request failed with status ${response.status}`);
				}

				const payload = await response.json();
				const questions = extractQuestions(payload);

				if (questions.length > 0) {
					setSuggestions(questions);
				}
			} catch (error) {
				if ((error as Error)?.name === 'AbortError') {
					return;
				}
				console.error('Failed to load FAQ suggestions', error);
			}
		};

		loadSuggestions();

		return () => controller.abort();
	}, []);

	return (
		<div className={createClassName(styles, 'welcome-page')}>
			<div className={createClassName(styles, 'message-stack')}>
				<div className={createClassName(styles, 'welcome-header')}>
					<img
						src={WelcomeImage}
						width={56}
						height={50}
						alt='Welcome'
						className={createClassName(styles, 'welcome-image')}
					/>
					<div className={createClassName(styles, 'message-group')}>
						<div className={createClassName(styles, 'bubble')}>
							شما با{' '}
							<strong className={createClassName(styles, 'bubble-strong')}>
								پشتیبان هوشمند کاریزما
							</strong>{' '}
							صحبت می‌کنید.
						</div>
						<div className={createClassName(styles, 'timestamp')}>
							پشتیبان هوشمند - {currentTime}
						</div>
					</div>
				</div>

				<div className={createClassName(styles, 'message-group')}>
					<div className={createClassName(styles, 'bubble')}>
						از من سوال کن یا یکی از موارد زیر رو انتخاب کن.
					</div>
					<div className={createClassName(styles, 'timestamp')}>
						پشتیبان هوشمند - {currentTime}
					</div>
				</div>
			</div>

			{suggestions.length > 0 && (
				<div className={createClassName(styles, 'chips-wrap')}>
					{suggestions.map((text) => (
						<Button
							key={text}
							className={createClassName(styles, 'chip')}
							onClick={() => onSelectSuggestion(text)}
						>
							{text}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}

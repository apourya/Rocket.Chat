import type { ComponentChildren, Ref } from 'preact';
import { useState, type CSSProperties, type ChangeEvent, type TargetedEvent } from 'preact/compat';

import styles from './styles.scss';
import { createClassName } from '../../helpers/createClassName';

type FilesDropTargetProps = {
	overlayed?: boolean;
	overlayText?: string;
	accept?: string;
	multiple?: boolean;
	className?: string;
	style?: CSSProperties;
	children?: ComponentChildren;
	inputRef?: Ref<HTMLInputElement>;
	onUpload?: (files: File[]) => void;
};

export const FilesDropTarget = ({
	overlayed,
	overlayText,
	accept,
	multiple,
	className,
	style = {},
	children,
	inputRef,
	onUpload,
}: FilesDropTargetProps) => {
	const [dragLevel, setDragLevel] = useState(0);

	const handleDragOver = (event: TargetedEvent<HTMLElement, DragEvent>) => {
		event.preventDefault();
	};

	const handleDragEnter = (event: TargetedEvent<HTMLElement, DragEvent>) => {
		event.preventDefault();
		setDragLevel(dragLevel + 1);
	};

	const handleDragLeave = (event: TargetedEvent<HTMLElement, DragEvent>) => {
		event.preventDefault();
		setDragLevel(dragLevel - 1);
	};

	const handleDrop = (event: TargetedEvent<HTMLElement, DragEvent>) => {
		event.preventDefault();

		if (dragLevel === 0 || !event?.dataTransfer?.files?.length) {
			return;
		}

		setDragLevel(0);

		handleUpload(event?.dataTransfer?.files);
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event?.currentTarget?.files?.length) {
			return;
		}

		handleUpload(event.currentTarget.files);
	};

	const handleUpload = (files: FileList) => {
		if (!onUpload) {
			return;
		}

		// Keep `accept` on the input for the native file picker only.
		// Do not silently filter dropped/pasted files here so the parent can show validation errors.
		let selectedFiles = Array.from(files);

		if (!multiple) {
			selectedFiles = selectedFiles.slice(0, 1);
		}

		selectedFiles.length && onUpload(selectedFiles);
	};

	return (
		<div
			data-overlay-text={overlayText}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={createClassName(styles, 'drop', { overlayed, dragover: dragLevel > 0 }, [className])}
			style={style}
			id='files-drop-target'
		>
			<input
				ref={inputRef}
				type='file'
				accept={accept}
				multiple={multiple}
				onChange={handleInputChange}
				className={createClassName(styles, 'drop__input')}
			/>
			{children}
		</div>
	);
};

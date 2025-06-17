// src/lib/components/FileUploadVM.svelte.ts

// Define a type for a single receipt item for strong typing
type ReceiptItem = {
	name: string;
	quantity: number;
	price: number;
};

// Define a type for a full receipt
type Receipt = {
	store?: string;
	date?: string;
	total?: number;
	items: ReceiptItem[];
};

export class FileUploadVM {
	// --- State ---
	selectedFiles: File[] = $state([]);
	isDragging: boolean = $state(false);
	isSubmitting: boolean = $state(false);
	actionResult: { type: 'success' | 'failure'; message: string } | null = $state(null);
	// New state property to hold successfully processed receipts
	processedReceipts: Receipt[] = $state([]);

	// --- Logic / Methods ---

	/**
	 * Handles file selection from the file input dialog.
	 */
	handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			this.addFiles(target.files);
		}
	};

	/**
	 * Handles files dropped onto the drop zone.
	 */
	handleDrop = (event: DragEvent) => {
		event.preventDefault();
		this.isDragging = false;
		if (event.dataTransfer?.files) {
			this.addFiles(event.dataTransfer.files);
		}
	};

	/**
	 * Sets dragging state for visual feedback.
	 */
	handleDragEnter = () => {
		this.isDragging = true;
	};

	handleDragLeave = () => {
		this.isDragging = false;
	};

	/**
	 * Adds new files to the selection and clears any previous result messages or receipts.
	 */
	private addFiles(files: FileList) {
		const newFiles = Array.from(files);
		this.selectedFiles.push(...newFiles);
		this.actionResult = null;
		this.processedReceipts = []; // Clear previous receipts when new files are added.
	}

	/**
	 * Removes a file from the selection.
	 */
	removeFile = (index: number) => {
		this.selectedFiles.splice(index, 1);
		if (this.selectedFiles.length === 0) {
			this.actionResult = null;
			this.processedReceipts = []; // Also clear receipts if selection is cleared.
		}
	};
}

// Export a singleton instance of the ViewModel.
export const fileUploadVM = new FileUploadVM();

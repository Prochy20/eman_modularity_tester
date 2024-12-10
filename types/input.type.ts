export interface EmailInput {
	datetime: Date;
	from: From;
	subject: string;
	personalizations: Personalization[];
	content: Content[];
	attachments?: Attachment[];
}

export interface Attachment {
	content: string;
	filename: string;
	type: string;
	disposition: string;
}

export interface Content {
	type: Type;
	value: string;
}

export enum Type {
	TextPlain = 'text/plain',
}

export interface From {
	email: string;
}

export interface Personalization {
	to: From[];
}

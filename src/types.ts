export type AppliedMigration = {
	id: string;
	checksum: string;
	executionTimeInMillis: number;
	appliedAt: Date;
};

export type Migration = {
	id: string;
	content: string;
};

CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`storage_path` text NOT NULL,
	`checksum` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'person' NOT NULL,
	`name` text NOT NULL,
	`company_name` text,
	`phone` text,
	`email` text,
	`address` text,
	`notes` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`template_version_id` text NOT NULL,
	`organization_id` text,
	`contact_id` text,
	`document_number` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`data_json` text NOT NULL,
	`rendered_snapshot_html` text,
	`finalized_at` text,
	`void_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `numbering_sequences` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`prefix` text NOT NULL,
	`current_number` integer DEFAULT 0 NOT NULL,
	`padding` integer DEFAULT 4 NOT NULL,
	`reset_rule` text DEFAULT 'yearly' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`address` text,
	`phone` text,
	`email` text,
	`tax_id` text,
	`logo_asset_id` text,
	`settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scanned_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`original_name` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`raw_text` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`asset_id` text NOT NULL,
	`contact_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `template_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`version` text NOT NULL,
	`schema_json` text NOT NULL,
	`renderer_key` text NOT NULL,
	`sample_data_json` text DEFAULT '{}' NOT NULL,
	`print_settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`latest_version_id` text,
	`default_numbering_format` text,
	`is_enabled` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);
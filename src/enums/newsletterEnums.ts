/**
 * Newsletter subscription status enumeration
 */
export enum NewsletterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced'
}

/**
 * Newsletter subscription status labels for display
 */
export const NewsletterStatusLabels: Record<NewsletterStatus, string> = {
  [NewsletterStatus.ACTIVE]: 'Active',
  [NewsletterStatus.INACTIVE]: 'Inactive',
  [NewsletterStatus.UNSUBSCRIBED]: 'Unsubscribed',
  [NewsletterStatus.BOUNCED]: 'Bounced'
};

/**
 * Email campaign status enumeration
 */
export enum EmailCampaignStatus {
  DRAFT = 'draft',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  SCHEDULED = 'scheduled'
}

/**
 * Email campaign status labels for display
 */
export const EmailCampaignStatusLabels: Record<EmailCampaignStatus, string> = {
  [EmailCampaignStatus.DRAFT]: 'Draft',
  [EmailCampaignStatus.SENDING]: 'Sending',
  [EmailCampaignStatus.SENT]: 'Sent',
  [EmailCampaignStatus.FAILED]: 'Failed',
  [EmailCampaignStatus.SCHEDULED]: 'Scheduled'
};

/**
 * Newsletter subscription source enumeration
 */
export enum NewsletterSource {
  WEBSITE = 'website',
  API = 'api',
  IMPORT = 'import',
  MANUAL = 'manual'
};

/**
 * Newsletter subscription source labels for display
 */
export const NewsletterSourceLabels: Record<NewsletterSource, string> = {
  [NewsletterSource.WEBSITE]: 'Website',
  [NewsletterSource.API]: 'API',
  [NewsletterSource.IMPORT]: 'Import',
  [NewsletterSource.MANUAL]: 'Manual'
};

/**
 * Email campaign type enumeration
 */
export enum EmailCampaignType {
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  ANNOUNCEMENT = 'announcement',
  SURVEY = 'survey'
};

/**
 * Email campaign type labels for display
 */
export const EmailCampaignTypeLabels: Record<EmailCampaignType, string> = {
  [EmailCampaignType.NEWSLETTER]: 'Newsletter',
  [EmailCampaignType.PROMOTIONAL]: 'Promotional',
  [EmailCampaignType.ANNOUNCEMENT]: 'Announcement',
  [EmailCampaignType.SURVEY]: 'Survey'
};

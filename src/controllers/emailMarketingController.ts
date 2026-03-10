import { Response } from 'express';
import { EmailCampaign, IEmailCampaign } from '../models/EmailCampaign';
import { NewsletterSubscription } from '../models/NewsletterSubscription';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';
import { emailService } from '../services/emailService';
import { EmailCampaignStatus } from '../enums/newsletterEnums';

// Create Email Campaign
export const createEmailCampaign = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { name, subject, content, recipients, scheduledAt } = req.body;

    const campaign = new EmailCampaign({
      name,
      subject,
      content,
      recipients: recipients.map((email: string) => email.toLowerCase().trim()),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: req.user?._id
    });

    await campaign.save();

    res.status(201).json(createSuccessResponse('Email campaign created successfully', campaign));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create email campaign', error.message));
  }
};

// Send Email Campaign
export const sendEmailCampaign = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      res.status(404).json(createErrorResponse('Email campaign not found'));
      return;
    }

    if (campaign.status === 'sent') {
      res.status(400).json(createErrorResponse('Campaign has already been sent'));
      return;
    }

    if (campaign.status === 'sending') {
      res.status(400).json(createErrorResponse('Campaign is currently being sent'));
      return;
    }

    // Update campaign status to sending
    campaign.status = EmailCampaignStatus.SENDING;
    await campaign.save();

    // Send emails in background
    sendCampaignInBackground(campaign._id.toString());

    res.status(200).json(createSuccessResponse('Email campaign sending started', {
      campaignId: campaign._id,
      totalRecipients: campaign.totalRecipients
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to send email campaign', error.message));
  }
};

// Background function to send campaign
async function sendCampaignInBackground(campaignId: string) {
  try {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    const result = await emailService.sendBulkMarketingEmails(
      campaign.recipients,
      campaign.subject,
      campaign.content,
      (sent, total, email, success) => {
        // Update progress in real-time (could use WebSocket for real-time updates)
        console.log(`Campaign progress: ${sent}/${total} - ${email} - ${success ? 'Success' : 'Failed'}`);
      }
    );

    // Update campaign with results
    campaign.successfulSends = result.successful.length;
    campaign.failedSends = result.failed.length;
    campaign.sentAt = new Date();
    campaign.status = EmailCampaignStatus.SENT; // Mark as sent even if some failed
    await campaign.save();

    console.log(`Campaign ${campaignId} completed: ${result.successful.length} successful, ${result.failed.length} failed`);
  } catch (error) {
    console.error(`Campaign ${campaignId} failed:`, error);
    
    // Mark campaign as failed
    await EmailCampaign.findByIdAndUpdate(campaignId, {
      status: EmailCampaignStatus.FAILED,
      sentAt: new Date()
    });
  }
}

// Get All Email Campaigns
export const getAllEmailCampaigns = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const campaigns = await EmailCampaign.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await EmailCampaign.countDocuments(query);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    res.status(200).json(createSuccessResponse('Email campaigns retrieved successfully', {
      campaigns,
      pagination
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve email campaigns', error.message));
  }
};

// Get Email Campaign by ID
export const getEmailCampaignById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await EmailCampaign.findById(id).populate('createdBy', 'name email');

    if (!campaign) {
      res.status(404).json(createErrorResponse('Email campaign not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Email campaign retrieved successfully', campaign));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve email campaign', error.message));
  }
};

// Send Quick Email (to selected subscribers)
export const sendQuickEmail = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, content, selectedEmails } = req.body;

    if (!selectedEmails || !Array.isArray(selectedEmails) || selectedEmails.length === 0) {
      res.status(400).json(createErrorResponse('Selected emails array is required'));
      return;
    }

    // Validate email addresses
    const validEmails = selectedEmails.filter((email: string) => {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      return emailRegex.test(email.trim());
    });

    if (validEmails.length === 0) {
      res.status(400).json(createErrorResponse('No valid email addresses provided'));
      return;
    }

    // Send emails in background
    sendQuickEmailInBackground(subject, content, validEmails);

    res.status(200).json(createSuccessResponse('Quick email sending started', {
      totalRecipients: validEmails.length,
      message: 'Emails are being sent in the background'
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to send quick email', error.message));
  }
};

// Background function for quick email
async function sendQuickEmailInBackground(subject: string, content: string, recipients: string[]) {
  try {
    const result = await emailService.sendBulkMarketingEmails(
      recipients,
      subject,
      content,
      (sent, total, email, success) => {
        console.log(`Quick email progress: ${sent}/${total} - ${email} - ${success ? 'Success' : 'Failed'}`);
      }
    );

    console.log(`Quick email completed: ${result.successful.length} successful, ${result.failed.length} failed`);
  } catch (error) {
    console.error('Quick email failed:', error);
  }
}

// Send Test Email
export const sendTestEmail = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json(createErrorResponse('Email address is required'));
      return;
    }

    const result = await emailService.sendTestMarketingEmail(email);

    if (result.success) {
      res.status(200).json(createSuccessResponse('Test email sent successfully', {
        email: email
      }));
    } else {
      res.status(500).json(createErrorResponse('Failed to send test email', result.error));
    }
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to send test email', error.message));
  }
};

// Get Email Marketing Stats
export const getEmailMarketingStats = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const totalCampaigns = await EmailCampaign.countDocuments();
    const sentCampaigns = await EmailCampaign.countDocuments({ status: EmailCampaignStatus.SENT });
    const draftCampaigns = await EmailCampaign.countDocuments({ status: EmailCampaignStatus.DRAFT });
    const failedCampaigns = await EmailCampaign.countDocuments({ status: EmailCampaignStatus.FAILED });

    // Get total emails sent
    const campaigns = await EmailCampaign.find({ status: EmailCampaignStatus.SENT });
    const totalEmailsSent = campaigns.reduce((sum, campaign) => sum + campaign.successfulSends, 0);
    const totalEmailsFailed = campaigns.reduce((sum, campaign) => sum + campaign.failedSends, 0);

    // Get recent campaigns (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCampaigns = await EmailCampaign.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json(createSuccessResponse('Email marketing statistics retrieved successfully', {
      campaigns: {
        total: totalCampaigns,
        sent: sentCampaigns,
        draft: draftCampaigns,
        failed: failedCampaigns,
        recent: recentCampaigns
      },
      emails: {
        totalSent: totalEmailsSent,
        totalFailed: totalEmailsFailed,
        successRate: totalEmailsSent + totalEmailsFailed > 0 
          ? Math.round((totalEmailsSent / (totalEmailsSent + totalEmailsFailed)) * 100) 
          : 0
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve email marketing statistics', error.message));
  }
};

// Delete Email Campaign
export const deleteEmailCampaign = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      res.status(404).json(createErrorResponse('Email campaign not found'));
      return;
    }

    if (campaign.status === 'sending') {
      res.status(400).json(createErrorResponse('Cannot delete campaign that is currently being sent'));
      return;
    }

    await EmailCampaign.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Email campaign deleted successfully', {
      campaignName: campaign.name
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete email campaign', error.message));
  }
};

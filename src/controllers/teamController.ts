import { Response } from 'express';
import { TeamMember, ITeamMember } from '../models/TeamMember';
import { TeamPosition, TeamMemberTag } from '../enums/teamEnums';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';
import { cloudinaryUpload, cloudinaryDelete } from '../services/cloudinaryService';

// Create Team Member
export const createTeamMember = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      position,
      tagline,
      yearsOfExperience,
      email,
      contactNumber,
      whatsappNumber,
      specializations,
      bio,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      isActive = true,
      isFeatured = false,
      displayOrder = 0,
      tags
    } = req.body;

    // Handle image upload
    let image;
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'team');
        image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: name || 'Team member'
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload team member image', error.message));
        return;
      }
    } else if (req.body.image) {
      // If image is provided as JSON (for updates)
      image = req.body.image;
    } else {
      res.status(400).json(createErrorResponse('Team member image is required'));
      return;
    }

    const teamMember = new TeamMember({
      name,
      position,
      tagline,
      yearsOfExperience,
      email,
      contactNumber,
      whatsappNumber,
      image,
      specializations,
      bio,
      linkedinUrl,
      twitterUrl,
      facebookUrl,
      instagramUrl,
      isActive,
      isFeatured,
      displayOrder,
      tags
    });

    await teamMember.save();

    res.status(201).json(createSuccessResponse('Team member created successfully', teamMember));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(createErrorResponse('Team member with this email already exists'));
      return;
    }
    res.status(500).json(createErrorResponse('Failed to create team member', error.message));
  }
};

// Get All Team Members
export const getAllTeamMembers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      position,
      tags,
      isActive,
      isFeatured,
      search
    } = req.query;

    // Build query
    const query: any = {};

    if (position) {
      query.position = position;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const teamMembers = await TeamMember.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await TeamMember.countDocuments(query);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    res.status(200).json(createSuccessResponse('Team members retrieved successfully', {
      teamMembers,
      pagination
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve team members', error.message));
  }
};

// Get Team Member by ID
export const getTeamMemberById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      res.status(404).json(createErrorResponse('Team member not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Team member retrieved successfully', teamMember));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve team member', error.message));
  }
};

// Update Team Member
export const updateTeamMember = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      res.status(404).json(createErrorResponse('Team member not found'));
      return;
    }

    // Handle image upload
    if (req.file) {
      try {
        // Delete old image if exists
        if (teamMember.image?.publicId) {
          await cloudinaryDelete(teamMember.image.publicId);
        }

        const uploadResult = await cloudinaryUpload(req.file.buffer, 'team');
        updateData.image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: updateData.name || teamMember.name || 'Team member'
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload team member image', error.message));
        return;
      }
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(createSuccessResponse('Team member updated successfully', updatedTeamMember));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(createErrorResponse('Team member with this email already exists'));
      return;
    }
    res.status(500).json(createErrorResponse('Failed to update team member', error.message));
  }
};

// Delete Team Member
export const deleteTeamMember = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      res.status(404).json(createErrorResponse('Team member not found'));
      return;
    }

    // Delete image from Cloudinary
    if (teamMember.image?.publicId) {
      try {
        await cloudinaryDelete(teamMember.image.publicId);
      } catch (error) {
        console.error('Failed to delete team member image:', error);
      }
    }

    await TeamMember.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Team member deleted successfully', {
      name: teamMember.name
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete team member', error.message));
  }
};

// Bulk Delete Team Members
export const bulkDeleteTeamMembers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json(createErrorResponse('Valid team member IDs array is required'));
      return;
    }

    // Find team members to get their images
    const teamMembers = await TeamMember.find({ _id: { $in: ids } });

    // Delete images from Cloudinary
    for (const member of teamMembers) {
      if (member.image?.publicId) {
        try {
          await cloudinaryDelete(member.image.publicId);
        } catch (error) {
          console.error('Failed to delete team member image:', error);
        }
      }
    }

    const result = await TeamMember.deleteMany({ _id: { $in: ids } });

    res.status(200).json(createSuccessResponse('Team members deleted successfully', {
      deletedCount: result.deletedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete team members', error.message));
  }
};

// Get Featured Team Members
export const getFeaturedTeamMembers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const teamMembers = await TeamMember.find({
      isActive: true,
      isFeatured: true
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit as string));

    res.status(200).json(createSuccessResponse('Featured team members retrieved successfully', teamMembers));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve featured team members', error.message));
  }
};

// Get Team Members by Position
export const getTeamMembersByPosition = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { position } = req.params;

    if (!Object.values(TeamPosition).includes(position as TeamPosition)) {
      res.status(400).json(createErrorResponse('Invalid position'));
      return;
    }

    const teamMembers = await TeamMember.find({
      position: position as TeamPosition,
      isActive: true
    })
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json(createSuccessResponse('Team members by position retrieved successfully', teamMembers));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve team members by position', error.message));
  }
};

// Get Team Statistics
export const getTeamStatistics = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const total = await TeamMember.countDocuments();
    const active = await TeamMember.countDocuments({ isActive: true });
    const featured = await TeamMember.countDocuments({ isFeatured: true });

    // Count by positions
    const positionStats = await TeamMember.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Count by tags
    const tagStats = await TeamMember.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json(createSuccessResponse('Team statistics retrieved successfully', {
      total,
      active,
      featured,
      inactive: total - active,
      positionStats,
      tagStats
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve team statistics', error.message));
  }
};

// Toggle Team Member Status
export const toggleTeamMemberStatus = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);

    if (!teamMember) {
      res.status(404).json(createErrorResponse('Team member not found'));
      return;
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();

    res.status(200).json(createSuccessResponse('Team member status updated successfully', {
      id: teamMember._id,
      isActive: teamMember.isActive
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to update team member status', error.message));
  }
};

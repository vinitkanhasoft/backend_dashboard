import mongoose, { Document, Schema } from 'mongoose';
import { TeamPosition, TeamPositionLabels, TeamMemberTag, TeamMemberTagLabels } from '../enums/teamEnums';

// Team Member Interface
export interface ITeamMember extends Document {
  // Basic Information
  name: string;
  position: TeamPosition;
  tagline: string;
  yearsOfExperience: number;
  
  // Contact Information
  email: string;
  contactNumber: {
    countryCode: string;
    number: string;
    fullNumber: string;
  };
  whatsappNumber: {
    countryCode: string;
    number: string;
    fullNumber: string;
  };
  
  // Profile Information
  image: {
    url: string;
    publicId: string;
    alt?: string;
  };
  
  // Expertise and Specializations
  tags: TeamMemberTag[];
  specializations?: string[];
  
  // Additional Information
  bio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  
  // Status and Visibility
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Team Member Schema
const TeamMemberSchema = new Schema<ITeamMember>({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Team member name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: Object.values(TeamPosition),
    trim: true
  },
  tagline: {
    type: String,
    required: [true, 'Tagline is required'],
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  contactNumber: {
    countryCode: {
      type: String,
      required: [true, 'Contact number country code is required'],
      match: [/^\+\d{1,4}$/, 'Country code must start with + followed by 1-4 digits']
    },
    number: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{6,15}$/, 'Contact number must be 6-15 digits']
    },
    fullNumber: {
      type: String,
      required: [true, 'Full contact number is required']
    }
  },
  whatsappNumber: {
    countryCode: {
      type: String,
      required: [true, 'WhatsApp country code is required'],
      match: [/^\+\d{1,4}$/, 'Country code must start with + followed by 1-4 digits']
    },
    number: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      match: [/^\d{6,15}$/, 'WhatsApp number must be 6-15 digits']
    },
    fullNumber: {
      type: String,
      required: [true, 'Full WhatsApp number is required']
    }
  },
  
  // Profile Information
  image: {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Image public ID is required']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    }
  },
  
  // Expertise and Specializations
  tags: [{
    type: String,
    required: true,
    enum: Object.values(TeamMemberTag)
  }],
  specializations: [{
    type: String,
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters']
  }],
  
  // Additional Information
  bio: {
    type: String,
    trim: true,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  linkedinUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL']
  },
  twitterUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?twitter\.com\/.*$/, 'Please provide a valid Twitter URL']
  },
  facebookUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?facebook\.com\/.*$/, 'Please provide a valid Facebook URL']
  },
  instagramUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?instagram\.com\/.*$/, 'Please provide a valid Instagram URL']
  },
  
  // Status and Visibility
  isActive: {
    type: Boolean,
    default: true,
    comment: 'Whether the team member is active'
  },
  isFeatured: {
    type: Boolean,
    default: false,
    comment: 'Whether the team member is featured'
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: [0, 'Display order cannot be negative'],
    comment: 'Order in which to display team members'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
TeamMemberSchema.index({ position: 1 });
TeamMemberSchema.index({ isActive: 1 });
TeamMemberSchema.index({ isFeatured: 1 });
TeamMemberSchema.index({ displayOrder: 1 });
TeamMemberSchema.index({ tags: 1 });
TeamMemberSchema.index({ email: 1 });

// Pre-save middleware to format phone numbers
TeamMemberSchema.pre('save', function(next) {
  // Format full contact number
  if (this.contactNumber.countryCode && this.contactNumber.number) {
    this.contactNumber.fullNumber = this.contactNumber.countryCode + this.contactNumber.number;
  }
  
  // Format full WhatsApp number
  if (this.whatsappNumber.countryCode && this.whatsappNumber.number) {
    this.whatsappNumber.fullNumber = this.whatsappNumber.countryCode + this.whatsappNumber.number;
  }
  
  next();
});

// Virtual for position label
TeamMemberSchema.virtual('positionLabel').get(function() {
  return TeamPositionLabels[this.position] || this.position;
});

// Virtual for tag labels
TeamMemberSchema.virtual('tagLabels').get(function() {
  return this.tags.map(tag => TeamMemberTagLabels[tag] || tag);
});

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import profileService, { ProfileData } from "@/lib/services/profile.service";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Camera,
  Save,
  X,
  Edit2,
  CheckCircle,
  Crown,
  Briefcase,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [accountStats, setAccountStats] = useState({
    totalActions: 0,
    activeSessions: 0,
    lastLogin: new Date().toISOString(),
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    company: "",
    location: "",
    website: "",
    position: "",
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    ...profileData,
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
    loadAccountStats();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      const merged = {
        fullName: data.fullName || user?.fullName || "",
        email: data.email || user?.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        company: data.company || "",
        location: data.location || "",
        website: data.website || "",
        position: data.position || "",
        avatar: data.profilePicture || data.avatar || "",
        profilePicture: data.profilePicture || data.avatar || "",
      };
      setProfileData(merged);
      setOriginalData(merged);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountStats = async () => {
    try {
      const stats = await profileService.getAccountStats();
      setAccountStats(stats);
    } catch (error) {
      console.error("Error loading account stats:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileService.updateProfile(profileData);
      setOriginalData({ ...profileData });
      setIsEditing(false);

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({ ...originalData });
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingAvatar(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const url = await profileService.uploadAvatar(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("Profile picture updated successfully");

      // Refresh profile to get new avatar URL
      await loadProfile();

      // Clear preview after short delay
      setTimeout(() => {
        setAvatarPreview(null);
        setUploadProgress(0);
      }, 1000);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setAvatarPreview(null);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const accountCreatedDate = new Date(
    user?.createdAt || Date.now()
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="border-2 border-gray-200/50 dark:border-gray-800/50 shadow-xl">
          <CardContent className="p-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    {avatarPreview || profileData.avatar ? (
                      <img
                        src={avatarPreview || profileData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Upload Progress Overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-300"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 28 * (1 - uploadProgress / 100)
                            }`}
                            className="text-white transition-all duration-300"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                          {uploadProgress}%
                        </span>
                      </div>
                      <p className="text-white text-xs">Uploading...</p>
                    </div>
                  </div>
                )}

                {isEditing && !isUploadingAvatar && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {user?.fullName || "User"}
                  {user?.adminLevel === "super_admin" && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">
                      {user?.adminLevel || "User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {accountCreatedDate}</span>
                  </div>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <Camera className="w-3 h-3 inline mr-1" />
                    Click the camera icon to upload a new profile picture (max
                    5MB)
                  </p>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-gray-500" />
                  Company
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={profileData.company}
                  onChange={(e) =>
                    setProfileData({ ...profileData, company: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label
                  htmlFor="position"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Position
                </Label>
                <Input
                  id="position"
                  placeholder="Your job title"
                  value={profileData.position}
                  onChange={(e) =>
                    setProfileData({ ...profileData, position: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Website */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="website"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-gray-500" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profileData.website}
                  onChange={(e) =>
                    setProfileData({ ...profileData, website: e.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "transition-all",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                  className={cn(
                    "transition-all resize-none",
                    !isEditing && "bg-gray-50 dark:bg-gray-900/50"
                  )}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500">
                    {(profileData.bio || "").length}/500 characters
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Role
                </span>
                <span className="text-sm font-medium capitalize">
                  {user?.adminLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Verified
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  2FA
                </span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Not Set
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last Login
                </span>
                <span className="text-sm font-medium">Today</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Sessions
                </span>
                <span className="text-sm font-medium">2 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Actions
                </span>
                <span className="text-sm font-medium">156 Total</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

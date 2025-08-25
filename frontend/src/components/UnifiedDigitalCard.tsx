import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_CONFIG, UPLOAD_CONFIG } from "@/config/api";
import { PersonProfile } from "@/lib/profileData";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import {
  Mail,
  MapPin,
  Globe,
  X,
  Send,
  FileText,
  Settings,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Save,
  Upload,
  Plus,
  Zap,
  Check,
  Loader2,
} from "lucide-react";

interface UnifiedDigitalCardProps {
  profile: PersonProfile;
  isEditing?: boolean;
  canEdit?: boolean; // Controls whether edit button shows
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onProfileChange?: (profile: PersonProfile) => void;
  username?: string; // Optional username prop for message sending
}

interface UnifiedDigitalCardRef {
  handleOutsideClick: () => void;
}

// Utility Functions
const createInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const handleExternalLink = (url: string, useMailto = false): void => {
  // Check if URL already has a protocol
  const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
  const finalUrl = useMailto 
    ? `mailto:${url}` 
    : (hasProtocol ? url : `https://${url}`);
  const target = useMailto ? "_self" : "_blank";
  window.open(finalUrl, target, useMailto ? "" : "noopener,noreferrer");
};

const copyToClipboard = async (text: string, type: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
    document.body.removeChild(textArea);
  }
};

// Sub-components
const EditableProfileImage = ({
  src,
  alt,
  initials,
  isEditing,
  onImageChange,
}: {
  src: string;
  alt: string;
  initials: string;
  isEditing: boolean;
  onImageChange?: (imageUrl: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      toast.error("Invalid file type. Please upload a valid image (JPEG, PNG, WebP, or GIF).");
      return false;
    }

    // Check file size (100KB limit)
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE.AVATAR) {
      toast.error(`File too large. Maximum size is ${Math.round(UPLOAD_CONFIG.MAX_FILE_SIZE.AVATAR / 1024)}KB for profile images.`);
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;

    // Validate file before upload
    if (!validateFile(file)) {
      return;
    }

    try {
      setUploading(true);
      
      // Create form data for profile image upload
      const formData = new FormData();
      formData.append("image", file);

      // Get auth token
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Upload to the correct profile image endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload/profile-image`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      if (data.success && data.data?.url) {
        onImageChange(data.data.url);
        toast.success("Profile image uploaded successfully!");
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-2 ring-gray-100 mx-auto md:mx-0 cursor-pointer hover:ring-blue-200 transition-all duration-200">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div className="hidden w-full h-full bg-gray-800 items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>
      </div>

      {isEditing && onImageChange && (
        <>
          <button
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className={`absolute -bottom-1 -right-1 text-white rounded-full p-1.5 shadow-lg transition-colors ${
              uploading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

const EditableField = ({
  value,
  isEditing,
  onChange,
  placeholder,
  className = "",
  multiline = false,
  maxLength,
}: {
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
}) => {
  const handleChange = (newValue: string) => {
    if (maxLength && newValue.length > maxLength) {
      return; // Don't allow input beyond max length
    }
    onChange?.(newValue);
  };

  if (!isEditing) {
    return <span className={className}>{value}</span>;
  }

  if (multiline) {
    return (
      <div>
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} min-h-[60px] resize-none bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
          onClick={(e) => e.stopPropagation()}
        />
        {maxLength && (
          <div className="mt-1 text-right">
            <p className={`text-xs ${
              value.length > maxLength * 0.9 
                ? value.length >= maxLength 
                  ? 'text-red-500' 
                  : 'text-orange-500'
                : 'text-gray-500'
            }`}>
              {value.length}/{maxLength} characters
            </p>
            {value.length >= maxLength && (
              <p className="text-xs text-red-500 mt-1">
                Character limit reached
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
      onClick={(e) => e.stopPropagation()}
      maxLength={maxLength}
    />
  );
};

const EditableContactInfo = ({
  icon: Icon,
  value,
  isEditing,
  onChange,
  placeholder,
  isClickable = false,
  onClick,
  onIconClick,
  showTick = false,
  fieldType = "default", // Add field type to differentiate handling
}: {
  icon: any;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  isClickable?: boolean;
  onClick?: () => void;
  onIconClick?: () => void;
  showTick?: boolean;
  fieldType?: "email" | "website" | "default";
}) => (
  <div className="flex items-center text-gray-600 dark:text-zinc-400 justify-center md:justify-start min-w-0 w-full transition-colors duration-300">
    {showTick ? (
      <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 transition-all duration-200" />
    ) : (
      <Icon
        className="w-4 h-4 mr-2 text-gray-400 dark:text-zinc-500 flex-shrink-0 cursor-pointer hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
        onClick={(e: any) => {
          e.stopPropagation();
          onIconClick?.();
        }}
      />
    )}
    {isEditing ? (
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="text-xs bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-7 min-w-0 w-full"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <span
        className={`text-xs min-w-0 flex-1 ${
          isClickable
            ? "cursor-pointer hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
            : ""
        } ${
          (fieldType === "website" || fieldType === "email") && value.length > 20
            ? "overflow-hidden text-ellipsis whitespace-nowrap" 
            : "break-words"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title={(fieldType === "website" || fieldType === "email") && value.length > 20 ? value : undefined}
      >
        {(fieldType === "website" || fieldType === "email") && value.length > 20 
          ? `${value.substring(0, 20)}...` 
          : value}
      </span>
    )}
  </div>
);

const EditableSkills = ({
  skills = [],
  isEditing,
  onChange,
}: {
  skills: string[];
  isEditing: boolean;
  onChange?: (skills: string[]) => void;
}) => {
  const [newSkill, setNewSkill] = useState("");
  const [showLimitError, setShowLimitError] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim()) && onChange) {
      // Check if user already has 25 skills
      if (skills.length >= 25) {
        setShowLimitError(true);
        // Hide error after 3 seconds
        setTimeout(() => setShowLimitError(false), 3000);
        return;
      }
      
      onChange([...skills, newSkill.trim()]);
      setNewSkill("");
      setShowLimitError(false);
    }
  };

  const removeSkill = (index: number) => {
    if (onChange) {
      onChange(skills.filter((_, i) => i !== index));
    }
  };

  if (!isEditing && (!skills || skills.length === 0)) return null;

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-medium transition-colors duration-200 ${
              isEditing ? "pr-1" : ""
            }`}
          >
            {skill}
            {isEditing && onChange && (
              <button
                onClick={() => removeSkill(index)}
                className="ml-1 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors duration-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {isEditing && onChange && skills.length < 25 && (
          <div className="inline-flex items-center gap-1">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add skill"
              className="h-7 px-2 text-xs bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-20 text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={addSkill}
              className="text-blue-500 hover:text-blue-600"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* Skills count and limit message */}
      {isEditing && onChange && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {skills.length}/25 skills
          </p>
          {skills.length >= 25 && (
            <p className="text-xs text-red-500 mt-1">
              Maximum 25 skills allowed
            </p>
          )}
          {showLimitError && (
            <p className="text-xs text-red-500 mt-1 animate-pulse">
              You can't add more than 25 skills
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
const UnifiedDigitalCard = forwardRef<
  UnifiedDigitalCardRef,
  UnifiedDigitalCardProps
>(
  (
    {
      profile,
      isEditing = false,
      canEdit = true,
      onEdit,
      onSave,
      onCancel,
      onProfileChange,
      username,
    },
    ref,
  ) => {
    const { isAuthenticated, user } = useAuthStore();
    const urlParams = useParams<{ username: string }>();
    const [isFlipped, setIsFlipped] = useState(false);
    const [messageTitle, setMessageTitle] = useState("");
    const [messageText, setMessageText] = useState("");
    const [cardHeight, setCardHeight] = useState(320); // minimum height
    const frontCardRef = useRef<HTMLDivElement>(null);
    const backCardRef = useRef<HTMLDivElement>(null);
    const [copyStates, setCopyStates] = useState({
      email: false,
      website: false,
      location: false,
    });

    // Expose outside click handler through ref
    useImperativeHandle(ref, () => ({
      handleOutsideClick: () => {
        if (isFlipped) {
          setIsFlipped(false);
        }
      },
    }));

    // Measure card height when content changes
    useEffect(() => {
      const measureHeight = () => {
        const frontHeight = frontCardRef.current?.scrollHeight || 0;
        const backHeight = backCardRef.current?.scrollHeight || 0;
        const maxHeight = Math.max(frontHeight, backHeight, 320); // minimum 320px
        setCardHeight(maxHeight);
      };

      measureHeight();
      // Re-measure when editing state changes or profile changes
      const timer = setTimeout(measureHeight, 100);
      return () => clearTimeout(timer);
    }, [isEditing, profile, isFlipped]);

    const handleProfileFieldChange = (
      field: keyof PersonProfile,
      value: any,
    ) => {
      if (onProfileChange) {
        onProfileChange({ ...profile, [field]: value });
      }
    };

    const handleCardClick = () => {
      if (!isEditing) {
        setIsFlipped(!isFlipped);
      }
    };

    const handleCloseCard = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFlipped(false);
    };

    const handleResumeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (profile.resumeUrl) {
        handleExternalLink(profile.resumeUrl);
      }
    };

    const handleCopyWithAnimation = async (
      text: string,
      type: string,
      field: keyof typeof copyStates,
    ) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);

        // Show tick animation
        setCopyStates((prev) => ({ ...prev, [field]: true }));

        // Reset after 2 seconds
        setTimeout(() => {
          setCopyStates((prev) => ({ ...prev, [field]: false }));
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          toast.success(`${type} copied to clipboard!`);

          // Show tick animation
          setCopyStates((prev) => ({ ...prev, [field]: true }));

          // Reset after 2 seconds
          setTimeout(() => {
            setCopyStates((prev) => ({ ...prev, [field]: false }));
          }, 2000);
        } catch (err) {
          toast.error("Failed to copy to clipboard");
        }
        document.body.removeChild(textArea);
      }
    };

    const handleInstantMessage = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated || !user) {
        toast.error("Please log in to use quick message templates");
        return;
      }

      // Get user's custom instant message template
      const instantSubject = user.instantMessageSubject || "Let's Connect!";
      const instantMessage = user.instantMessage || `Hi ${profile.name || "there"}!

I came across your profile and I'm really impressed by your work. I'd love to connect and discuss potential collaboration opportunities.

Looking forward to hearing from you!

Best regards`;

      // Replace ${name} with the profile owner's name
      const processedMessage = instantMessage.replace(
        /\$\{name\}/g,
        profile.name || "there"
      );

      setMessageTitle(instantSubject);
      setMessageText(processedMessage);
      toast.success("Quick message template loaded!");
    };

    const handleSendMessage = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        toast.error("Please log in to send a message");
        return;
      }

      if (!messageTitle.trim() || !messageText.trim()) {
        toast.error("Please fill in both subject and message");
        return;
      }

      if (!user?.email) {
        toast.error("Your email is not available. Please check your profile.");
        return;
      }

      // Get the target username from props or URL params
      const targetUsername = username || urlParams.username;
      
      if (!targetUsername) {
        toast.error("Profile username is not available");
        return;
      }

      // Clean username (remove @ if present)
      const cleanUsername = targetUsername.startsWith("@")
        ? targetUsername.slice(1)
        : targetUsername;

      try {
        const response = await api.sendMessage(cleanUsername, {
          message: `Subject: ${messageTitle}\n\n${messageText}`,
          senderEmail: user.email,
          senderName: user.name || "Anonymous",
        });

        if (response.success) {
          toast.success("Message sent successfully!");
          setMessageTitle("");
          setMessageText("");
          setIsFlipped(false);
        } else {
          toast.error(response.message || "Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    };

    return (
      <div className="perspective-1000 w-full">
        <div
          className={`relative w-full transition-transform duration-700 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            height: `${cardHeight}px`,
          }}
        >
          {/* Card Front */}
          <div
            ref={frontCardRef}
            className="absolute top-0 left-0 w-full backface-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden transition-colors duration-300"
            onClick={handleCardClick}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex flex-col relative min-h-80">
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                {isEditing && canEdit ? (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel?.();
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-200"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave?.();
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {profile.resumeUrl && (
                      <Button
                        onClick={handleResumeClick}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-200"
                      >
                        <FileText className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.();
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Profile Section */}
              <div className="flex-1 p-4">
                {/* Header with Image and Basic Info */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <EditableProfileImage
                    src={profile.profileImage || "/placeholder.svg"}
                    alt={profile.name || "Profile"}
                    initials={createInitials(profile.name || "U")}
                    isEditing={isEditing}
                    onImageChange={
                      isEditing
                        ? (url) => handleProfileFieldChange("profileImage", url)
                        : undefined
                    }
                  />

                  <div className="flex-1 min-w-0 text-center md:text-left md:mt-1">
                    <div
                      className="inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EditableField
                        value={profile.name || ""}
                        isEditing={isEditing}
                        onChange={
                          isEditing
                            ? (value) => handleProfileFieldChange("name", value)
                            : undefined
                        }
                        placeholder="Your name"
                        className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-1 leading-tight block w-full transition-colors duration-300"
                      />
                      <EditableField
                        value={profile.jobTitle || ""}
                        isEditing={isEditing}
                        onChange={
                          isEditing
                            ? (value) =>
                                handleProfileFieldChange("jobTitle", value)
                            : undefined
                        }
                        placeholder="Your job title"
                        className="text-gray-600 dark:text-zinc-400 text-sm md:text-base font-medium mb-3 block w-full transition-colors duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <EditableField
                    value={profile.bio || ""}
                    isEditing={isEditing}
                    onChange={
                      isEditing
                        ? (value) => handleProfileFieldChange("bio", value)
                        : undefined
                    }
                    placeholder="Write your bio..."
                    className="text-gray-700 dark:text-zinc-300 text-sm leading-relaxed text-center md:text-left w-full transition-colors duration-300"
                    multiline
                    maxLength={400}
                  />
                </div>

                {/* Resume Upload Section */}
                {isEditing && (
                  <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs font-semibold text-gray-800 mb-2 block">
                      Resume/CV Link
                    </label>
                    <Input
                      value={profile.resumeUrl || ""}
                      onChange={(e) =>
                        handleProfileFieldChange("resumeUrl", e.target.value)
                      }
                      placeholder="https://your-resume-link.com"
                      className="text-sm bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add a link to your resume, portfolio, or CV
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div className={`grid gap-3 md:gap-3.5 ${
                  // Determine grid layout based on available fields
                  (() => {
                    const hasWebsite = isEditing || profile.website?.trim();
                    const totalFields = 2 + (hasWebsite ? 1 : 0); // email + location + website (optional)
                    
                    if (totalFields === 2) {
                      // Better arrangement for just email and location - centered with max width
                      return "grid-cols-1 sm:grid-cols-2 sm:max-w-md sm:mx-auto";
                    } else if ((profile.email || "").length > 20) {
                      return "grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr]";
                    } else {
                      return "grid-cols-1 md:grid-cols-3";
                    }
                  })()
                }`}>
                  <div className="min-w-0">
                    <EditableContactInfo
                      icon={Mail}
                      value={profile.email || ""}
                      isEditing={isEditing}
                      onChange={
                        isEditing
                          ? (value) => handleProfileFieldChange("email", value)
                          : undefined
                      }
                      placeholder="email@example.com"
                      isClickable={!isEditing}
                      onClick={() =>
                        !isEditing &&
                        profile.email &&
                        handleExternalLink(profile.email, true)
                      }
                      onIconClick={() =>
                        !isEditing &&
                        profile.email &&
                        handleCopyWithAnimation(profile.email, "Email", "email")
                      }
                      showTick={copyStates.email}
                      fieldType="email"
                    />
                  </div>
                  {(isEditing || profile.website?.trim()) && (
                    <div className="min-w-0">
                      <EditableContactInfo
                        icon={Globe}
                        value={profile.website || ""}
                        isEditing={isEditing}
                        onChange={
                          isEditing
                            ? (value) => handleProfileFieldChange("website", value)
                            : undefined
                        }
                        placeholder="yourwebsite.com"
                        isClickable={!isEditing}
                        onClick={() =>
                          !isEditing &&
                          profile.website &&
                          handleExternalLink(profile.website)
                        }
                        onIconClick={() =>
                          !isEditing &&
                          profile.website &&
                          handleCopyWithAnimation(
                            profile.website,
                            "Website",
                            "website",
                          )
                        }
                        showTick={copyStates.website}
                        fieldType="website"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <EditableContactInfo
                      icon={MapPin}
                      value={profile.location || ""}
                      isEditing={isEditing}
                      onChange={
                        isEditing
                          ? (value) => handleProfileFieldChange("location", value)
                          : undefined
                      }
                      placeholder="Your location"
                      onIconClick={() =>
                        !isEditing &&
                        profile.location &&
                        handleCopyWithAnimation(
                          profile.location,
                          "Location",
                          "location",
                        )
                      }
                      showTick={copyStates.location}
                      fieldType="default"
                    />
                  </div>
                </div>

                {/* Skills */}
                <EditableSkills
                  skills={profile.skills || []}
                  isEditing={isEditing}
                  onChange={
                    isEditing
                      ? (skills) => handleProfileFieldChange("skills", skills)
                      : undefined
                  }
                />
              </div>

              {/* Call to Action */}
              {!isEditing && (
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                  <div className="text-center py-2">
                    <span className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
                      Tap card to send message
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Back - Message Form */}
          <div
            ref={backCardRef}
            className="absolute top-0 left-0 w-full backface-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-gray-100/80 dark:border-zinc-800/80 overflow-hidden transition-colors duration-300"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="min-h-80 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={handleCloseCard}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Send Message
                  </h2>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Let's connect</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Instant Message Button - Only for authenticated users */}
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInstantMessage}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 h-9 w-9 rounded-full transition-colors"
                      title="Quick message template"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseCard}
                    className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-2 h-9 w-9 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <ArrowRight className="w-3 h-3 -mb-0.5" />
                      <ArrowLeft className="w-3 h-3" />
                    </div>
                  </Button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-4 min-h-0 flex flex-col">
                <div className="space-y-4 flex-1">
                  <Input
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    placeholder="Subject"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 h-11 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Your message..."
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 resize-none text-sm w-full h-full min-h-20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Send Button */}
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex-shrink-0">
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageTitle.trim() || !messageText.trim()}
                  className="w-full bg-gray-900 dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 h-11 disabled:bg-gray-200 dark:disabled:bg-zinc-700 disabled:text-gray-400 dark:disabled:text-zinc-500 text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

UnifiedDigitalCard.displayName = "UnifiedDigitalCard";

export default UnifiedDigitalCard;

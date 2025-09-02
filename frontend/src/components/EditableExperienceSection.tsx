import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LIMITS, getLimit, hasReachedLimit } from "@/constants/profileLimits";
import { getIconFromName, getIconNameFromNode } from "@/lib/iconUtils";
import { defaultWorkExperiences } from "@/lib/workExperienceData";

import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Briefcase,
  Calendar,
  MapPin,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import WorkExperience, {
  WorkExperienceData,
  WorkProject,
} from "@/components/WorkExperience";

interface EditableExperienceSectionProps {
  experiences?: WorkExperienceData[];
  onExperiencesUpdate: (experiences: WorkExperienceData[]) => void;
  className?: string;
}

interface EditableExperienceItemProps {
  experience: WorkExperienceData;
  isEditing: boolean;
  index: number;
  onUpdate: (experience: WorkExperienceData) => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOverIndex: number | null;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const EditableExperienceItem = ({
  experience,
  isEditing,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  dragOverIndex,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: EditableExperienceItemProps) => {
  const [editingExperience, setEditingExperience] =
    useState<WorkExperienceData>(experience);

  const handleFieldChange = (
    field: keyof WorkExperienceData,
    value: string,
  ) => {
    // Apply character limits
    if (field === "position" && value.length > 50) {
      return; // Don't allow input beyond 50 characters
    }
    if (field === "company" && value.length > 50) {
      return; // Don't allow input beyond 50 characters
    }
    if (field === "duration" && value.length > 25) {
      return; // Don't allow input beyond 25 characters
    }
    if (field === "location" && value.length > 25) {
      return; // Don't allow input beyond 25 characters
    }
    if (field === "description" && value.length > 320) {
      return; // Don't allow input beyond 320 characters
    }
    
    const updated = { ...editingExperience, [field]: value };
    setEditingExperience(updated);
    onUpdate(updated);
  };

  const handleAchievementChange = (achievementIndex: number, value: string) => {
    // Apply character limit for achievements
    if (value.length > 150) {
      return; // Don't allow input beyond 150 characters
    }
    
    const updatedAchievements = [...editingExperience.achievements];
    updatedAchievements[achievementIndex] = value;
    const updated = { ...editingExperience, achievements: updatedAchievements };
    setEditingExperience(updated);
    onUpdate(updated);
  };

  const handleAddAchievement = () => {
    // Limit to maximum 8 achievements
    if (editingExperience.achievements.length >= 8) {
      return; // Don't allow more than 8 achievements
    }
    
    const updated = {
      ...editingExperience,
      achievements: [...editingExperience.achievements, ""],
    };
    setEditingExperience(updated);
    onUpdate(updated);
  };

  const handleRemoveAchievement = (achievementIndex: number) => {
    const updatedAchievements = editingExperience.achievements.filter(
      (_, i) => i !== achievementIndex,
    );
    const updated = { ...editingExperience, achievements: updatedAchievements };
    setEditingExperience(updated);
    onUpdate(updated);
  };

  const handleMoveAchievementUp = (achievementIndex: number) => {
    if (achievementIndex > 0) {
      const updatedAchievements = [...editingExperience.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex - 1];
      updatedAchievements[achievementIndex - 1] = item;
      const updated = { ...editingExperience, achievements: updatedAchievements };
      setEditingExperience(updated);
      onUpdate(updated);
    }
  };

  const handleMoveAchievementDown = (achievementIndex: number) => {
    if (achievementIndex < editingExperience.achievements.length - 1) {
      const updatedAchievements = [...editingExperience.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex + 1];
      updatedAchievements[achievementIndex + 1] = item;
      const updated = { ...editingExperience, achievements: updatedAchievements };
      setEditingExperience(updated);
      onUpdate(updated);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(index);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const isDraggedOver = dragOverIndex === index;
  const isBeingDragged = isDragging;

  if (isEditing) {
    return (
      <div
        className={`bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl transition-all duration-200 overflow-hidden shadow-sm ${
          isBeingDragged ? "opacity-50 scale-95" : ""
        } ${isDraggedOver ? "border-gray-300 dark:border-zinc-600 shadow-lg" : ""}`}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 space-y-4">
          {/* Drag Handle and Move Buttons */}
          <div className="flex items-center justify-between -mt-1 mb-2">
            <div 
              className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 cursor-grab active:cursor-grabbing select-none transition-colors duration-200"
              draggable
              onDragStart={handleDragStart}
            >
              <GripVertical className="w-4 h-4" />
              <span className="text-xs font-medium">Drag to reorder</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  canMoveUp 
                    ? 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800' 
                    : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  canMoveDown 
                    ? 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800' 
                    : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Position
              </label>
              <Input
                value={editingExperience.position}
                onChange={(e) => handleFieldChange("position", e.target.value)}
                placeholder="e.g., Senior UI/UX Designer"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={50}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingExperience.position.length > 45 
                    ? editingExperience.position.length >= 50 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500 dark:text-zinc-400'
                } transition-colors duration-200`}>
                  {editingExperience.position.length}/50 characters
                </p>
                {editingExperience.position.length >= 50 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Company
              </label>
              <Input
                value={editingExperience.company}
                onChange={(e) => handleFieldChange("company", e.target.value)}
                placeholder="e.g., TechCorp Inc."
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={50}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingExperience.company.length > 45 
                    ? editingExperience.company.length >= 50 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500 dark:text-zinc-400'
                } transition-colors duration-200`}>
                  {editingExperience.company.length}/50 characters
                </p>
                {editingExperience.company.length >= 50 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Duration
              </label>
              <Input
                value={editingExperience.duration}
                onChange={(e) => handleFieldChange("duration", e.target.value)}
                placeholder="e.g., 2022 - Present"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={25}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingExperience.duration.length > 22 
                    ? editingExperience.duration.length >= 25 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500 dark:text-zinc-400'
                } transition-colors duration-200`}>
                  {editingExperience.duration.length}/25 characters
                </p>
                {editingExperience.duration.length >= 25 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Location
              </label>
              <Input
                value={editingExperience.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="e.g., San Francisco, CA"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={25}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingExperience.location.length > 22 
                    ? editingExperience.location.length >= 25 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500 dark:text-zinc-400'
                } transition-colors duration-200`}>
                  {editingExperience.location.length}/25 characters
                </p>
                {editingExperience.location.length >= 25 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
              Description
            </label>
            <Textarea
              value={editingExperience.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief description of your role and responsibilities..."
              className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium min-h-20 resize-none transition-colors duration-200"
              maxLength={320}
            />
            <div className="text-right">
              <p className={`text-xs ${
                editingExperience.description.length > 288 
                  ? editingExperience.description.length >= 320 
                    ? 'text-red-500' 
                    : 'text-orange-500'
                  : 'text-gray-500 dark:text-zinc-400'
              } transition-colors duration-200`}>
                {editingExperience.description.length}/320 characters
              </p>
              {editingExperience.description.length >= 320 && (
                <p className="text-xs text-red-500 mt-1">
                  Character limit reached
                </p>
              )}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">Icon</label>
            <IconPicker
              selectedIcon={editingExperience.iconName ? getIconFromName(editingExperience.iconName) : null}
              onIconSelect={(icon, iconName) => {
                const updated = { ...editingExperience, iconName }; // Store iconName string instead of React component
                setEditingExperience(updated);
                onUpdate(updated);
              }}
              placeholder="Choose an icon for this experience"
            />
          </div>

          {/* Achievements Section */}
          {(editingExperience.achievements.length > 0 || 
            editingExperience.achievements.some(ach => ach.trim() !== '')) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                  Key Achievements ({editingExperience.achievements.length}/8)
                </label>
                <Button
                  onClick={handleAddAchievement}
                  variant="ghost"
                  size="sm"
                  disabled={editingExperience.achievements.length >= 8}
                  className={`h-7 px-2 text-xs ${
                    editingExperience.achievements.length >= 8
                      ? 'text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                  } transition-colors duration-200`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {editingExperience.achievements.length >= 8 ? 'Max Reached' : 'Add Achievement'}
                </Button>
              </div>

              <div className="space-y-2">
                {editingExperience.achievements.map(
                (achievement, achievementIndex) => (
                  <div
                    key={achievementIndex}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) =>
                          handleAchievementChange(
                            achievementIndex,
                            e.target.value,
                          )
                        }
                        placeholder="Achievement description"
                        className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-8 flex-1 transition-colors duration-200"
                        maxLength={150}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveAchievementUp(achievementIndex)}
                          disabled={achievementIndex === 0}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                            achievementIndex === 0
                              ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveAchievementDown(achievementIndex)}
                          disabled={achievementIndex === editingExperience.achievements.length - 1}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                            achievementIndex === editingExperience.achievements.length - 1
                              ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <Button
                        onClick={() => handleRemoveAchievement(achievementIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 h-8 w-8 p-1 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right pr-16">{/* Added more right padding to account for the new buttons */}
                      <p className={`text-xs ${
                        achievement.length > 135 
                          ? achievement.length >= 150 
                            ? 'text-red-500' 
                            : 'text-orange-500'
                          : 'text-gray-500 dark:text-zinc-400'
                      } transition-colors duration-200`}>
                        {achievement.length}/150 characters
                      </p>
                      {achievement.length >= 150 && (
                        <p className="text-xs text-red-500 mt-1">
                          Character limit reached
                        </p>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
          )}

          {/* Add Achievements Button - Show when no achievements exist */}
          {editingExperience.achievements.length === 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleAddAchievement}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 w-full border border-dashed border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Key Achievements
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end items-center pt-2 border-t border-gray-100">
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-white hover:bg-red-600 h-8 px-3 font-medium border border-red-200 hover:border-red-600 transition-all"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors duration-200">
          {experience.iconName ? getIconFromName(experience.iconName) : <Briefcase className="w-4 h-4 text-gray-600" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 font-medium text-sm">
            {experience.position}
          </div>
          <div className="text-gray-500 text-xs mt-0.5 truncate">
            {experience.company} • {experience.duration}
          </div>
        </div>

        {/* View indicator */}
        <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
      </div>
    </button>
  );
};

export default function EditableExperienceSection({
  experiences = defaultWorkExperiences,
  onExperiencesUpdate,
  className = "",
}: EditableExperienceSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperiences, setEditingExperiences] =
    useState<WorkExperienceData[]>(experiences);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const experienceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Helper function to clean up experiences by removing empty strings
  const cleanupExperiences = (experiences: WorkExperienceData[]): WorkExperienceData[] => {
    return experiences.map(exp => ({
      ...exp,
      achievements: exp.achievements.filter(ach => ach.trim() !== '')
    }));
  };

  const handleStartEdit = () => {
    setEditingExperiences(cleanupExperiences([...experiences]));
    setIsEditing(true);
  };

  const handleSave = () => {
    // Clean up experiences before saving
    const cleanedExperiences = cleanupExperiences(editingExperiences);
    
    // Show immediate feedback
    toast.success("Update Queued");
    
    onExperiencesUpdate(cleanedExperiences);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingExperiences(cleanupExperiences([...experiences]));
    setIsEditing(false);
  };

  const handleExperienceUpdate = (
    index: number,
    updatedExperience: WorkExperienceData,
  ) => {
    const updated = [...editingExperiences];
    updated[index] = updatedExperience;
    setEditingExperiences(updated);
  };

  const handleExperienceDelete = (index: number) => {
    const updated = editingExperiences.filter((_, i) => i !== index);
    setEditingExperiences(updated);
  };

  const handleAddExperience = () => {
    // Check if limit is reached
    if (hasReachedLimit(editingExperiences.length, 'EXPERIENCE')) {
      toast.error(`Maximum ${getLimit('EXPERIENCE')} work experiences allowed.`);
      return;
    }

    const newExperience: WorkExperienceData = {
      id: `custom-${Date.now()}`,
      company: "",
      position: "",
      duration: "", 
      location: "",
      description: "",
      projects: [],
      achievements: [],
      iconName: "Briefcase", // Store iconName as string
    };
    setEditingExperiences([...editingExperiences, newExperience]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return;

    if (index !== draggedIndex) {
      setDragOverIndex(index);

      // Reorder the array
      const newExperiences = [...editingExperiences];
      const draggedItem = newExperiences[draggedIndex];
      newExperiences.splice(draggedIndex, 1);
      newExperiences.splice(index, 0, draggedItem);

      setEditingExperiences(newExperiences);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newExperiences = [...editingExperiences];
      const item = newExperiences[index];
      newExperiences[index] = newExperiences[index - 1];
      newExperiences[index - 1] = item;
      setEditingExperiences(newExperiences);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < editingExperiences.length - 1) {
      const newExperiences = [...editingExperiences];
      const item = newExperiences[index];
      newExperiences[index] = newExperiences[index + 1];
      newExperiences[index + 1] = item;
      setEditingExperiences(newExperiences);
    }
  };

  const handleExperienceExpand = (experienceId: string) => {
    if (expandedExperience === experienceId) {
      setExpandedExperience(null);
    } else {
      setExpandedExperience(experienceId);
    }
  };

  // Auto-scroll when experience expands
  useEffect(() => {
    if (expandedExperience && experienceRefs.current[expandedExperience]) {
      const timer = setTimeout(() => {
        const expandedElement = experienceRefs.current[expandedExperience];
        if (expandedElement) {
          expandedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [expandedExperience]);

  // Close expandable experiences when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setExpandedExperience(null);
        return;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentExperiences = isEditing ? editingExperiences : experiences;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Experience
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
            {isEditing
              ? "Edit your professional experience and achievements"
              : "My professional journey and key achievements"}
          </p>
        </div>

        <div className="ml-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
              </Button>
              <Button
                onClick={handleSave}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartEdit}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Experience List */}
      <div ref={containerRef} className="space-y-2">
        {isEditing ? (
          <>
            {/* Editing Mode - Show editable items */}
            {currentExperiences.map((experience, index) => (
              <EditableExperienceItem
                key={experience.id}
                experience={experience}
                isEditing={isEditing}
                index={index}
                onUpdate={(updated) => handleExperienceUpdate(index, updated)}
                onDelete={() => handleExperienceDelete(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                dragOverIndex={dragOverIndex}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < currentExperiences.length - 1}
              />
            ))}

            {/* Add New Experience Button */}
            <button
              onClick={handleAddExperience}
              disabled={hasReachedLimit(editingExperiences.length, 'EXPERIENCE')}
              className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                hasReachedLimit(editingExperiences.length, 'EXPERIENCE')
                  ? 'border-gray-100 dark:border-zinc-800 text-gray-300 dark:text-zinc-600 cursor-not-allowed bg-gray-50 dark:bg-zinc-900'
                  : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasReachedLimit(editingExperiences.length, 'EXPERIENCE')
                  ? `Maximum ${getLimit('EXPERIENCE')} experiences reached`
                  : 'Add New Experience'
                }
              </span>
            </button>
          </>
        ) : (
          <>
            {/* View Mode - Show expandable experiences like in demo */}
            {currentExperiences.map((experience) => (
              <div
                key={experience.id}
                ref={(el) => (experienceRefs.current[experience.id] = el)}
              >
                <WorkExperience
                  experience={experience}
                  isOpen={expandedExperience === experience.id}
                  onClose={() => setExpandedExperience(null)}
                  onExpand={() => handleExperienceExpand(experience.id)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

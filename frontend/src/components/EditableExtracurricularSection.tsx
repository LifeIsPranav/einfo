import Extracurricular from "@/components/Extracurricular";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LIMITS, getLimit, hasReachedLimit } from "@/constants/profileLimits";
import { defaultExtracurriculars } from "@/lib/extracurricularsData";
import { getIconFromName, getIconNameFromNode } from "@/lib/iconUtils";
import type { ExtracurricularData } from "@/types/newSections";

import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Users,
  Calendar,
  MapPin,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableExtracurricularSectionProps {
  extracurriculars?: ExtracurricularData[];
  onExtracurricularsUpdate: (extracurriculars: ExtracurricularData[]) => void;
  className?: string;
}

interface EditableExtracurricularItemProps {
  extracurricular: ExtracurricularData;
  isEditing: boolean;
  index: number;
  onUpdate: (extracurricular: ExtracurricularData) => void;
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

const EditableExtracurricularItem = ({
  extracurricular,
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
}: EditableExtracurricularItemProps) => {
  const [editingExtracurricular, setEditingExtracurricular] =
    useState<ExtracurricularData>(extracurricular);

  const handleFieldChange = (field: keyof ExtracurricularData, value: string) => {
    // Apply character limits
    if (field === "activityName" && value.length > 100) {
      return; // Don't allow input beyond 100 characters
    }
    if (field === "organization" && value.length > 80) {
      return; // Don't allow input beyond 80 characters
    }
    if (field === "duration" && value.length > 25) {
      return; // Don't allow input beyond 25 characters
    }
    if (field === "location" && value.length > 40) {
      return; // Don't allow input beyond 40 characters
    }
    if (field === "role" && value.length > 60) {
      return; // Don't allow input beyond 60 characters
    }
    if (field === "description" && value.length > 350) {
      return; // Don't allow input beyond 350 characters
    }
    if (field === "websiteUrl" && value.length > 200) {
      return; // Don't allow input beyond 200 characters
    }

    const updated = { ...editingExtracurricular, [field]: value };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleTypeChange = (value: string) => {
    const updated = { ...editingExtracurricular, type: value as ExtracurricularData["type"] };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleResponsibilityChange = (responsibilityIndex: number, value: string) => {
    // Apply character limit for responsibilities
    if (value.length > 150) {
      return; // Don't allow input beyond 150 characters
    }
    
    const updatedResponsibilities = [...editingExtracurricular.responsibilities];
    updatedResponsibilities[responsibilityIndex] = value;
    const updated = { ...editingExtracurricular, responsibilities: updatedResponsibilities };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleAddResponsibility = () => {
    // Limit to maximum 10 responsibilities
    if (editingExtracurricular.responsibilities.length >= 10) {
      return; // Don't allow more than 10 responsibilities
    }
    
    const updated = {
      ...editingExtracurricular,
      responsibilities: [...editingExtracurricular.responsibilities, ""],
    };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleRemoveResponsibility = (responsibilityIndex: number) => {
    const updatedResponsibilities = editingExtracurricular.responsibilities.filter(
      (_, i) => i !== responsibilityIndex,
    );
    const updated = { ...editingExtracurricular, responsibilities: updatedResponsibilities };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleMoveResponsibilityUp = (responsibilityIndex: number) => {
    if (responsibilityIndex > 0) {
      const updatedResponsibilities = [...editingExtracurricular.responsibilities];
      const item = updatedResponsibilities[responsibilityIndex];
      updatedResponsibilities[responsibilityIndex] = updatedResponsibilities[responsibilityIndex - 1];
      updatedResponsibilities[responsibilityIndex - 1] = item;
      const updated = { ...editingExtracurricular, responsibilities: updatedResponsibilities };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleMoveResponsibilityDown = (responsibilityIndex: number) => {
    if (responsibilityIndex < editingExtracurricular.responsibilities.length - 1) {
      const updatedResponsibilities = [...editingExtracurricular.responsibilities];
      const item = updatedResponsibilities[responsibilityIndex];
      updatedResponsibilities[responsibilityIndex] = updatedResponsibilities[responsibilityIndex + 1];
      updatedResponsibilities[responsibilityIndex + 1] = item;
      const updated = { ...editingExtracurricular, responsibilities: updatedResponsibilities };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleAchievementChange = (achievementIndex: number, value: string) => {
    // Apply character limit for achievements
    if (value.length > 150) {
      return; // Don't allow input beyond 150 characters
    }
    
    const updatedAchievements = [...editingExtracurricular.achievements];
    updatedAchievements[achievementIndex] = value;
    const updated = { ...editingExtracurricular, achievements: updatedAchievements };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleAddAchievement = () => {
    // Limit to maximum 8 achievements
    if (editingExtracurricular.achievements.length >= 8) {
      return; // Don't allow more than 8 achievements
    }
    
    const updated = {
      ...editingExtracurricular,
      achievements: [...editingExtracurricular.achievements, ""],
    };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleRemoveAchievement = (achievementIndex: number) => {
    const updatedAchievements = editingExtracurricular.achievements.filter(
      (_, i) => i !== achievementIndex,
    );
    const updated = { ...editingExtracurricular, achievements: updatedAchievements };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleMoveAchievementUp = (achievementIndex: number) => {
    if (achievementIndex > 0) {
      const updatedAchievements = [...editingExtracurricular.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex - 1];
      updatedAchievements[achievementIndex - 1] = item;
      const updated = { ...editingExtracurricular, achievements: updatedAchievements };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleMoveAchievementDown = (achievementIndex: number) => {
    if (achievementIndex < editingExtracurricular.achievements.length - 1) {
      const updatedAchievements = [...editingExtracurricular.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex + 1];
      updatedAchievements[achievementIndex + 1] = item;
      const updated = { ...editingExtracurricular, achievements: updatedAchievements };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleSkillChange = (skillIndex: number, value: string) => {
    // Apply character limit for skills
    if (value.length > 40) {
      return; // Don't allow input beyond 40 characters
    }
    
    const updatedSkills = [...editingExtracurricular.skillsDeveloped];
    updatedSkills[skillIndex] = value;
    const updated = { ...editingExtracurricular, skillsDeveloped: updatedSkills };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleAddSkill = () => {
    // Limit to maximum 12 skills
    if (editingExtracurricular.skillsDeveloped.length >= 12) {
      return; // Don't allow more than 12 skills
    }
    
    const updated = {
      ...editingExtracurricular,
      skillsDeveloped: [...editingExtracurricular.skillsDeveloped, ""],
    };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleRemoveSkill = (skillIndex: number) => {
    const updatedSkills = editingExtracurricular.skillsDeveloped.filter(
      (_, i) => i !== skillIndex,
    );
    const updated = { ...editingExtracurricular, skillsDeveloped: updatedSkills };
    setEditingExtracurricular(updated);
    onUpdate(updated);
  };

  const handleMoveSkillUp = (skillIndex: number) => {
    if (skillIndex > 0) {
      const updatedSkills = [...editingExtracurricular.skillsDeveloped];
      const item = updatedSkills[skillIndex];
      updatedSkills[skillIndex] = updatedSkills[skillIndex - 1];
      updatedSkills[skillIndex - 1] = item;
      const updated = { ...editingExtracurricular, skillsDeveloped: updatedSkills };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleMoveSkillDown = (skillIndex: number) => {
    if (skillIndex < editingExtracurricular.skillsDeveloped.length - 1) {
      const updatedSkills = [...editingExtracurricular.skillsDeveloped];
      const item = updatedSkills[skillIndex];
      updatedSkills[skillIndex] = updatedSkills[skillIndex + 1];
      updatedSkills[skillIndex + 1] = item;
      const updated = { ...editingExtracurricular, skillsDeveloped: updatedSkills };
      setEditingExtracurricular(updated);
      onUpdate(updated);
    }
  };

  const handleDragStart = () => {
    onDragStart(index);
  };

  const handleDragOver = () => {
    onDragOver(index);
  };

  if (isEditing) {
    return (
      <div
        className={`bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 transition-all duration-200 ${
          isDragging ? "opacity-50" : ""
        } ${dragOverIndex === index ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/50" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          handleDragOver();
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDragEnd();
        }}
      >
        <div className="space-y-4">
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
                Activity Name
              </label>
              <Input
                value={editingExtracurricular.activityName}
                onChange={(e) => handleFieldChange("activityName", e.target.value)}
                placeholder="e.g., University Debate Team Captain"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={100}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingExtracurricular.activityName.length > 90 
                    ? editingExtracurricular.activityName.length >= 100 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingExtracurricular.activityName.length}/100 characters
                </p>
                {editingExtracurricular.activityName.length >= 100 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Organization
              </label>
              <Input
                value={editingExtracurricular.organization}
                onChange={(e) =>
                  handleFieldChange("organization", e.target.value)
                }
                placeholder="e.g., UC Berkeley Debate Society"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={80}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingExtracurricular.organization.length > 72 
                    ? editingExtracurricular.organization.length >= 80 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingExtracurricular.organization.length}/80 characters
                </p>
                {editingExtracurricular.organization.length >= 80 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Duration
              </label>
              <Input
                value={editingExtracurricular.duration}
                onChange={(e) => handleFieldChange("duration", e.target.value)}
                placeholder="e.g., 2018 - 2020"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={25}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingExtracurricular.duration.length > 22 
                    ? editingExtracurricular.duration.length >= 25 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingExtracurricular.duration.length}/25
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Location
              </label>
              <Input
                value={editingExtracurricular.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="e.g., Berkeley, CA"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={40}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingExtracurricular.location.length > 36 
                    ? editingExtracurricular.location.length >= 40 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingExtracurricular.location.length}/40
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Role
              </label>
              <Input
                value={editingExtracurricular.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                placeholder="e.g., Team Captain"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={60}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingExtracurricular.role.length > 54 
                    ? editingExtracurricular.role.length >= 60 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingExtracurricular.role.length}/60
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Type
              </label>
              <Select
                value={editingExtracurricular.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="volunteering">Volunteering</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="advocacy">Advocacy</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Image URL (Optional)
              </label>
              <Input
                value={editingExtracurricular.imageUrl || ""}
                onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/photo-example.jpg"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Website URL (Optional)
              </label>
              <Input
                value={editingExtracurricular.websiteUrl || ""}
                onChange={(e) =>
                  handleFieldChange("websiteUrl", e.target.value)
                }
                placeholder="e.g., https://organization.com"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
              Description
            </label>
            <Textarea
              value={editingExtracurricular.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief description of your role and activities..."
              className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium min-h-20 resize-none transition-colors duration-200"
              maxLength={350}
            />
            <div className="text-right">
              <p className={`text-xs transition-colors duration-200 ${
                editingExtracurricular.description.length > 315 
                  ? editingExtracurricular.description.length >= 350 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}>
                {editingExtracurricular.description.length}/350 characters
              </p>
              {editingExtracurricular.description.length >= 350 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                  Character limit reached
                </p>
              )}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">Icon</label>
            <IconPicker
              selectedIcon={editingExtracurricular.iconName ? getIconFromName(editingExtracurricular.iconName) : null}
              onIconSelect={(icon, iconName) => {
                const updated = { ...editingExtracurricular, iconName }; // Store iconName string instead of React component
                setEditingExtracurricular(updated);
                onUpdate(updated);
              }}
              placeholder="Choose an icon for this activity"
            />
          </div>

          {/* Responsibilities Section */}
          {(editingExtracurricular.responsibilities.length > 0 || 
            editingExtracurricular.responsibilities.some(resp => resp.trim() !== '')) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                  Key Responsibilities ({editingExtracurricular.responsibilities.length}/10)
                </label>
                <Button
                  onClick={handleAddResponsibility}
                  variant="ghost"
                  size="sm"
                  disabled={editingExtracurricular.responsibilities.length >= 10}
                  className={`h-7 px-2 text-xs transition-colors duration-200 ${
                    editingExtracurricular.responsibilities.length >= 10
                      ? 'text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {editingExtracurricular.responsibilities.length >= 10 ? 'Max Reached' : 'Add Responsibility'}
                </Button>
              </div>

              <div className="space-y-2">
                {editingExtracurricular.responsibilities.map((responsibility, responsibilityIndex) => (
                <div key={responsibilityIndex} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={responsibility}
                        onChange={(e) =>
                          handleResponsibilityChange(responsibilityIndex, e.target.value)
                        }
                        placeholder="Key responsibility description"
                        className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-8 transition-colors duration-200"
                        maxLength={150}
                      />
                      <div className="text-right">
                        <span className={`text-xs transition-colors duration-200 ${
                          responsibility.length > 135 
                            ? responsibility.length >= 150 
                              ? 'text-red-500 dark:text-red-400' 
                              : 'text-orange-500 dark:text-orange-400'
                            : 'text-gray-500 dark:text-zinc-400'
                        }`}>
                          {responsibility.length}/150
                        </span>
                        {responsibility.length >= 150 && (
                          <span className="text-xs text-red-500 dark:text-red-400 ml-1 transition-colors duration-200">• Limit reached</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => handleMoveResponsibilityUp(responsibilityIndex)}
                        disabled={responsibilityIndex === 0}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          responsibilityIndex === 0
                            ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveResponsibilityDown(responsibilityIndex)}
                        disabled={responsibilityIndex === editingExtracurricular.responsibilities.length - 1}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          responsibilityIndex === editingExtracurricular.responsibilities.length - 1
                            ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <Button
                        onClick={() => handleRemoveResponsibility(responsibilityIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 h-5 w-5 p-0 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Add Responsibilities Button - Show when no responsibilities exist */}
          {editingExtracurricular.responsibilities.length === 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleAddResponsibility}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 w-full border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Key Responsibilities
              </Button>
            </div>
          )}

          {/* Achievements Section */}
          {(editingExtracurricular.achievements.length > 0 || 
            editingExtracurricular.achievements.some(ach => ach.trim() !== '')) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                  Notable Achievements ({editingExtracurricular.achievements.length}/8)
                </label>
                <Button
                  onClick={handleAddAchievement}
                variant="ghost"
                size="sm"
                disabled={editingExtracurricular.achievements.length >= 8}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  editingExtracurricular.achievements.length >= 8
                    ? 'text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {editingExtracurricular.achievements.length >= 8 ? 'Max Reached' : 'Add Achievement'}
              </Button>
            </div>

            <div className="space-y-2">
              {editingExtracurricular.achievements.map(
                (achievement, achievementIndex) => (
                  <div
                    key={achievementIndex}
                    className="space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          value={achievement}
                          onChange={(e) =>
                            handleAchievementChange(
                              achievementIndex,
                              e.target.value,
                            )
                          }
                          placeholder="Achievement description"
                          className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-8 transition-colors duration-200"
                          maxLength={150}
                        />
                        <div className="text-right">
                          <span className={`text-xs transition-colors duration-200 ${
                            achievement.length > 135 
                              ? achievement.length >= 150 
                                ? 'text-red-500 dark:text-red-400' 
                                : 'text-orange-500 dark:text-orange-400'
                              : 'text-gray-500 dark:text-zinc-400'
                          }`}>
                            {achievement.length}/150
                          </span>
                          {achievement.length >= 150 && (
                            <span className="text-xs text-red-500 dark:text-red-400 ml-1 transition-colors duration-200">• Limit reached</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
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
                          disabled={achievementIndex === editingExtracurricular.achievements.length - 1}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                            achievementIndex === editingExtracurricular.achievements.length - 1
                              ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <Button
                          onClick={() => handleRemoveAchievement(achievementIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 h-5 w-5 p-0 transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
          )}

          {/* Add Achievements Button - Show when no achievements exist */}
          {editingExtracurricular.achievements.length === 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleAddAchievement}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 w-full border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Notable Achievements
              </Button>
            </div>
          )}

          {/* Skills Developed Section */}
          {(editingExtracurricular.skillsDeveloped.length > 0 || 
            editingExtracurricular.skillsDeveloped.some(skill => skill.trim() !== '')) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                  Skills Developed ({editingExtracurricular.skillsDeveloped.length}/12)
                </label>
                <Button
                  onClick={handleAddSkill}
                  variant="ghost"
                  size="sm"
                  disabled={editingExtracurricular.skillsDeveloped.length >= 12}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  editingExtracurricular.skillsDeveloped.length >= 12
                    ? 'text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {editingExtracurricular.skillsDeveloped.length >= 12 ? 'Max Reached' : 'Add Skill'}
              </Button>
            </div>

            <div className="space-y-2">
              {editingExtracurricular.skillsDeveloped.map((skill, skillIndex) => (
                <div key={skillIndex} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={skill}
                        onChange={(e) =>
                          handleSkillChange(skillIndex, e.target.value)
                        }
                        placeholder="Skill name"
                        className="text-xs bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-8 transition-colors duration-200"
                        maxLength={40}
                      />
                      <div className="text-right">
                        <span className={`text-xs transition-colors duration-200 ${
                          skill.length > 36 
                            ? skill.length >= 40 
                              ? 'text-red-500 dark:text-red-400' 
                              : 'text-orange-500 dark:text-orange-400'
                            : 'text-gray-500 dark:text-zinc-400'
                        }`}>
                          {skill.length}/40
                        </span>
                        {skill.length >= 40 && (
                          <span className="text-xs text-red-500 dark:text-red-400 ml-1 transition-colors duration-200">• Limit reached</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => handleMoveSkillUp(skillIndex)}
                        disabled={skillIndex === 0}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          skillIndex === 0
                            ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveSkillDown(skillIndex)}
                        disabled={skillIndex === editingExtracurricular.skillsDeveloped.length - 1}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          skillIndex === editingExtracurricular.skillsDeveloped.length - 1
                            ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <Button
                        onClick={() => handleRemoveSkill(skillIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 h-5 w-5 p-0 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Add Skills Developed Button - Show when no skills exist */}
          {editingExtracurricular.skillsDeveloped.length === 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleAddSkill}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 w-full border border-dashed border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Skills Developed
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end items-center pt-2 border-t border-gray-100 dark:border-zinc-800 transition-colors duration-200">
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 h-8 px-3 font-medium border border-red-200 dark:border-red-800 hover:border-red-600 dark:hover:border-red-500 transition-all duration-200"
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
    <button className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors duration-200">
          {extracurricular.iconName ? getIconFromName(extracurricular.iconName) : (
            <Users className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 dark:text-white font-medium text-sm transition-colors duration-200">
            {extracurricular.activityName}
          </div>
          <div className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 truncate transition-colors duration-200">
            {extracurricular.organization} • {extracurricular.duration}
          </div>
        </div>

        {/* View indicator */}
        <Eye className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300 transition-colors duration-200" />
      </div>
    </button>
  );
};

export default function EditableExtracurricularSection({
  extracurriculars = defaultExtracurriculars,
  onExtracurricularsUpdate,
  className = "",
}: EditableExtracurricularSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingExtracurriculars, setEditingExtracurriculars] =
    useState<ExtracurricularData[]>(extracurriculars);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedExtracurricular, setExpandedExtracurricular] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const extracurricularRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Helper function to clean up extracurriculars by removing empty strings
  const cleanupExtracurriculars = (extracurriculars: ExtracurricularData[]): ExtracurricularData[] => {
    return extracurriculars.map(extracurricular => ({
      ...extracurricular,
      responsibilities: extracurricular.responsibilities.filter(resp => resp.trim() !== ''),
      achievements: extracurricular.achievements.filter(ach => ach.trim() !== ''),
      skillsDeveloped: extracurricular.skillsDeveloped.filter(skill => skill.trim() !== '')
    }));
  };

  const handleStartEdit = () => {
    setEditingExtracurriculars(cleanupExtracurriculars([...extracurriculars]));
    setIsEditing(true);
  };

  const handleSave = () => {
    // Clean up extracurriculars before saving
    const cleanedExtracurriculars = cleanupExtracurriculars(editingExtracurriculars);
    
    // Show immediate feedback
    toast.success("Update Queued");
    
    onExtracurricularsUpdate(cleanedExtracurriculars);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingExtracurriculars(cleanupExtracurriculars([...extracurriculars]));
    setIsEditing(false);
  };

  const handleExtracurricularUpdate = (
    index: number,
    updatedExtracurricular: ExtracurricularData,
  ) => {
    const updated = [...editingExtracurriculars];
    updated[index] = updatedExtracurricular;
    setEditingExtracurriculars(updated);
  };

  const handleExtracurricularDelete = (index: number) => {
    const updated = editingExtracurriculars.filter((_, i) => i !== index);
    setEditingExtracurriculars(updated);
  };

  const handleAddExtracurricular = () => {
    // Check if limit is reached
    if (hasReachedLimit(editingExtracurriculars.length, 'EXTRACURRICULARS')) {
      toast.error(`Maximum ${getLimit('EXTRACURRICULARS')} extracurricular entries allowed.`);
      return;
    }

    const newExtracurricular: ExtracurricularData = {
      id: `custom-${Date.now()}`,
      activityName: "Activity Name",
      organization: "Organization Name",
      duration: "",
      location: "",
      description: "",
      iconName: "Users", // Store iconName as string
      type: "leadership",
      role: "",
      responsibilities: [],
      achievements: [],
      skillsDeveloped: [],
    };
    setEditingExtracurriculars([...editingExtracurriculars, newExtracurricular]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return;

    if (index !== draggedIndex) {
      setDragOverIndex(index);

      // Reorder the array
      const newExtracurriculars = [...editingExtracurriculars];
      const draggedItem = newExtracurriculars[draggedIndex];
      newExtracurriculars.splice(draggedIndex, 1);
      newExtracurriculars.splice(index, 0, draggedItem);

      setEditingExtracurriculars(newExtracurriculars);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newExtracurriculars = [...editingExtracurriculars];
      const item = newExtracurriculars[index];
      newExtracurriculars[index] = newExtracurriculars[index - 1];
      newExtracurriculars[index - 1] = item;
      setEditingExtracurriculars(newExtracurriculars);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < editingExtracurriculars.length - 1) {
      const newExtracurriculars = [...editingExtracurriculars];
      const item = newExtracurriculars[index];
      newExtracurriculars[index] = newExtracurriculars[index + 1];
      newExtracurriculars[index + 1] = item;
      setEditingExtracurriculars(newExtracurriculars);
    }
  };

  const handleExtracurricularExpand = (extracurricularId: string) => {
    if (expandedExtracurricular === extracurricularId) {
      setExpandedExtracurricular(null);
    } else {
      setExpandedExtracurricular(extracurricularId);
    }
  };

  // Auto-scroll when extracurricular expands
  useEffect(() => {
    if (expandedExtracurricular && extracurricularRefs.current[expandedExtracurricular]) {
      const timer = setTimeout(() => {
        const expandedElement = extracurricularRefs.current[expandedExtracurricular];
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
  }, [expandedExtracurricular]);

  // Close expandable extracurricular when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setExpandedExtracurricular(null);
        return;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentExtracurriculars = isEditing ? editingExtracurriculars : extracurriculars;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Extracurricular Activities
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
            {isEditing
              ? "Edit your community involvement and personal interests"
              : "Community involvement and personal interests"}
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

      {/* Extracurriculars List */}
      <div ref={containerRef} className="space-y-2">
        {isEditing ? (
          <>
            {/* Editing Mode - Show editable items */}
            {currentExtracurriculars.map((extracurricularItem, index) => (
              <EditableExtracurricularItem
                key={extracurricularItem.id}
                extracurricular={extracurricularItem}
                isEditing={isEditing}
                index={index}
                onUpdate={(updated) => handleExtracurricularUpdate(index, updated)}
                onDelete={() => handleExtracurricularDelete(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                dragOverIndex={dragOverIndex}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < currentExtracurriculars.length - 1}
              />
            ))}

            {/* Add New Extracurricular Button */}
            <button
              onClick={handleAddExtracurricular}
              disabled={hasReachedLimit(editingExtracurriculars.length, 'EXTRACURRICULARS')}
              className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                hasReachedLimit(editingExtracurriculars.length, 'EXTRACURRICULARS')
                  ? 'border-gray-100 dark:border-zinc-800 text-gray-300 dark:text-zinc-600 cursor-not-allowed bg-gray-50 dark:bg-zinc-900'
                  : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasReachedLimit(editingExtracurriculars.length, 'EXTRACURRICULARS')
                  ? `Maximum ${getLimit('EXTRACURRICULARS')} extracurricular entries reached`
                  : 'Add New Activity'
                }
              </span>
            </button>
          </>
        ) : (
          <>
            {/* View Mode - Show expandable extracurriculars like in demo */}
            {currentExtracurriculars.map((extracurricularItem) => (
              <div
                key={extracurricularItem.id}
                ref={(el) => (extracurricularRefs.current[extracurricularItem.id] = el)}
              >
                <Extracurricular
                  extracurricular={extracurricularItem}
                  isOpen={expandedExtracurricular === extracurricularItem.id}
                  onClose={() => setExpandedExtracurricular(null)}
                  onExpand={() => handleExtracurricularExpand(extracurricularItem.id)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

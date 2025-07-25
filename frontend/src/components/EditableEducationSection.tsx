import Education, { EducationData } from "@/components/Education";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LIMITS, getLimit, hasReachedLimit } from "@/constants/profileLimits";
import { defaultEducation } from "@/lib/educationData";
import { getIconFromName, getIconNameFromNode } from "@/lib/iconUtils";

import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  GraduationCap,
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

interface EditableEducationSectionProps {
  education?: EducationData[];
  onEducationUpdate: (education: EducationData[]) => void;
  className?: string;
}

interface EditableEducationItemProps {
  education: EducationData;
  isEditing: boolean;
  index: number;
  onUpdate: (education: EducationData) => void;
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

const EditableEducationItem = ({
  education,
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
}: EditableEducationItemProps) => {
  const [editingEducation, setEditingEducation] =
    useState<EducationData>(education);

  const handleFieldChange = (field: keyof EducationData, value: string) => {
    // Apply character limits
    if (field === "degree" && value.length > 60) {
      return; // Don't allow input beyond 60 characters
    }
    if (field === "institution" && value.length > 60) {
      return; // Don't allow input beyond 60 characters
    }
    if (field === "duration" && value.length > 25) {
      return; // Don't allow input beyond 25 characters
    }
    if (field === "location" && value.length > 40) {
      return; // Don't allow input beyond 40 characters
    }
    if (field === "gpa" && value.length > 20) {
      return; // Don't allow input beyond 20 characters
    }
    if (field === "description" && value.length > 250) {
      return; // Don't allow input beyond 250 characters
    }
    
    const updated = { ...editingEducation, [field]: value };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleTypeChange = (value: string) => {
    const updated = {
      ...editingEducation,
      type: value as EducationData["type"],
    };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleAchievementChange = (achievementIndex: number, value: string) => {
    // Apply character limit for achievements
    if (value.length > 180) {
      return; // Don't allow input beyond 180 characters
    }
    
    const updatedAchievements = [...editingEducation.achievements];
    updatedAchievements[achievementIndex] = value;
    const updated = { ...editingEducation, achievements: updatedAchievements };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleAddAchievement = () => {
    // Limit to maximum 10 achievements
    if (editingEducation.achievements.length >= 10) {
      return; // Don't allow more than 10 achievements
    }
    
    const updated = {
      ...editingEducation,
      achievements: [...editingEducation.achievements, ""],
    };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleRemoveAchievement = (achievementIndex: number) => {
    const updatedAchievements = editingEducation.achievements.filter(
      (_, i) => i !== achievementIndex,
    );
    const updated = { ...editingEducation, achievements: updatedAchievements };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleMoveAchievementUp = (achievementIndex: number) => {
    if (achievementIndex > 0) {
      const updatedAchievements = [...editingEducation.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex - 1];
      updatedAchievements[achievementIndex - 1] = item;
      const updated = { ...editingEducation, achievements: updatedAchievements };
      setEditingEducation(updated);
      onUpdate(updated);
    }
  };

  const handleMoveAchievementDown = (achievementIndex: number) => {
    if (achievementIndex < editingEducation.achievements.length - 1) {
      const updatedAchievements = [...editingEducation.achievements];
      const item = updatedAchievements[achievementIndex];
      updatedAchievements[achievementIndex] = updatedAchievements[achievementIndex + 1];
      updatedAchievements[achievementIndex + 1] = item;
      const updated = { ...editingEducation, achievements: updatedAchievements };
      setEditingEducation(updated);
      onUpdate(updated);
    }
  };

  const handleCourseChange = (courseIndex: number, value: string) => {
    // Apply character limit for courses
    if (value.length > 50) {
      return; // Don't allow input beyond 50 characters
    }
    
    const updatedCourses = [...editingEducation.courses];
    updatedCourses[courseIndex] = value;
    const updated = { ...editingEducation, courses: updatedCourses };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleAddCourse = () => {
    // Limit to maximum 25 courses
    if (editingEducation.courses.length >= 25) {
      return; // Don't allow more than 25 courses
    }
    
    const updated = {
      ...editingEducation,
      courses: [...editingEducation.courses, ""],
    };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleRemoveCourse = (courseIndex: number) => {
    const updatedCourses = editingEducation.courses.filter(
      (_, i) => i !== courseIndex,
    );
    const updated = { ...editingEducation, courses: updatedCourses };
    setEditingEducation(updated);
    onUpdate(updated);
  };

  const handleMoveCourseUp = (courseIndex: number) => {
    if (courseIndex > 0) {
      const updatedCourses = [...editingEducation.courses];
      const item = updatedCourses[courseIndex];
      updatedCourses[courseIndex] = updatedCourses[courseIndex - 1];
      updatedCourses[courseIndex - 1] = item;
      const updated = { ...editingEducation, courses: updatedCourses };
      setEditingEducation(updated);
      onUpdate(updated);
    }
  };

  const handleMoveCourseDown = (courseIndex: number) => {
    if (courseIndex < editingEducation.courses.length - 1) {
      const updatedCourses = [...editingEducation.courses];
      const item = updatedCourses[courseIndex];
      updatedCourses[courseIndex] = updatedCourses[courseIndex + 1];
      updatedCourses[courseIndex + 1] = item;
      const updated = { ...editingEducation, courses: updatedCourses };
      setEditingEducation(updated);
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
        className={`bg-white border border-gray-100 rounded-xl transition-all duration-200 overflow-hidden shadow-sm ${
          isBeingDragged ? "opacity-50 scale-95" : ""
        } ${isDraggedOver ? "border-gray-300 shadow-lg" : ""}`}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 space-y-4">
          {/* Drag Handle and Move Buttons */}
          <div className="flex items-center justify-between -mt-1 mb-2">
            <div 
              className="flex items-center gap-2 text-gray-500 cursor-grab active:cursor-grabbing select-none"
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
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
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
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
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
              <label className="text-xs font-semibold text-gray-800">
                Degree/Certificate
              </label>
              <Input
                value={editingEducation.degree}
                onChange={(e) => handleFieldChange("degree", e.target.value)}
                placeholder="e.g., Bachelor of Science in Computer Science"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={60}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingEducation.degree.length > 54 
                    ? editingEducation.degree.length >= 60 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {editingEducation.degree.length}/60 characters
                </p>
                {editingEducation.degree.length >= 60 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                Institution
              </label>
              <Input
                value={editingEducation.institution}
                onChange={(e) =>
                  handleFieldChange("institution", e.target.value)
                }
                placeholder="e.g., University of California"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={60}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingEducation.institution.length > 54 
                    ? editingEducation.institution.length >= 60 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {editingEducation.institution.length}/60 characters
                </p>
                {editingEducation.institution.length >= 60 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                Duration
              </label>
              <Input
                value={editingEducation.duration}
                onChange={(e) => handleFieldChange("duration", e.target.value)}
                placeholder="e.g., 2016 - 2020"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={25}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingEducation.duration.length > 22 
                    ? editingEducation.duration.length >= 25 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {editingEducation.duration.length}/25 characters
                </p>
                {editingEducation.duration.length >= 25 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                Location
              </label>
              <Input
                value={editingEducation.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder="e.g., Berkeley, CA"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={40}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingEducation.location.length > 36 
                    ? editingEducation.location.length >= 40 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {editingEducation.location.length}/40 characters
                </p>
                {editingEducation.location.length >= 40 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                Type
              </label>
              <Select
                value={editingEducation.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="text-sm bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="degree">Degree</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                GPA (Optional)
              </label>
              <Input
                value={editingEducation.gpa || ""}
                onChange={(e) => handleFieldChange("gpa", e.target.value)}
                placeholder="e.g., 3.8/4.0"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={20}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  (editingEducation.gpa || "").length > 18 
                    ? (editingEducation.gpa || "").length >= 20 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {(editingEducation.gpa || "").length}/20 characters
                </p>
                {(editingEducation.gpa || "").length >= 20 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800">
                Website URL (Optional)
              </label>
              <Input
                value={editingEducation.websiteUrl || ""}
                onChange={(e) =>
                  handleFieldChange("websiteUrl", e.target.value)
                }
                placeholder="e.g., https://university.edu"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">
              Description
            </label>
            <Textarea
              value={editingEducation.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief description of your education and key learnings..."
              className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium min-h-20 resize-none"
              maxLength={250}
            />
            <div className="text-right">
              <p className={`text-xs ${
                editingEducation.description.length > 225 
                  ? editingEducation.description.length >= 250 
                    ? 'text-red-500' 
                    : 'text-orange-500'
                  : 'text-gray-500'
              }`}>
                {editingEducation.description.length}/250 characters
              </p>
              {editingEducation.description.length >= 250 && (
                <p className="text-xs text-red-500 mt-1">
                  Character limit reached
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">
              Image URL (Optional)
            </label>
            <Input
              value={editingEducation.imageUrl || ""}
              onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/photo-example.jpg"
              className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">Icon</label>
            <IconPicker
              selectedIcon={editingEducation.iconName ? getIconFromName(editingEducation.iconName) : null}
              onIconSelect={(icon, iconName) => {
                const updated = { ...editingEducation, iconName }; // Store iconName string instead of React component
                setEditingEducation(updated);
                onUpdate(updated);
              }}
              placeholder="Choose an icon for this education"
            />
          </div>

          {/* Courses Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">
                Key Courses ({editingEducation.courses.length}/25)
              </label>
              <Button
                onClick={handleAddCourse}
                variant="ghost"
                size="sm"
                disabled={editingEducation.courses.length >= 25}
                className={`h-7 px-2 text-xs ${
                  editingEducation.courses.length >= 25
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {editingEducation.courses.length >= 25 ? 'Max Reached' : 'Add Course'}
              </Button>
            </div>

            <div className="space-y-2">
              {editingEducation.courses.map((course, courseIndex) => (
                <div key={courseIndex} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={course}
                        onChange={(e) =>
                          handleCourseChange(courseIndex, e.target.value)
                        }
                        placeholder="Course name"
                        className="text-xs bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 h-8"
                        maxLength={50}
                      />
                      <div className="text-right">
                        <span className={`text-xs ${
                          course.length > 45 
                            ? course.length >= 50 
                              ? 'text-red-500' 
                              : 'text-orange-500'
                            : 'text-gray-500'
                        }`}>
                          {course.length}/50
                        </span>
                        {course.length >= 50 && (
                          <span className="text-xs text-red-500 ml-1">• Limit reached</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => handleMoveCourseUp(courseIndex)}
                        disabled={courseIndex === 0}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          courseIndex === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveCourseDown(courseIndex)}
                        disabled={courseIndex === editingEducation.courses.length - 1}
                        className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                          courseIndex === editingEducation.courses.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <Button
                        onClick={() => handleRemoveCourse(courseIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-5 w-5 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">
                Key Achievements ({editingEducation.achievements.length}/10)
              </label>
              <Button
                onClick={handleAddAchievement}
                variant="ghost"
                size="sm"
                disabled={editingEducation.achievements.length >= 10}
                className={`h-7 px-2 text-xs ${
                  editingEducation.achievements.length >= 10
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {editingEducation.achievements.length >= 10 ? 'Max Reached' : 'Add Achievement'}
              </Button>
            </div>

            <div className="space-y-2">
              {editingEducation.achievements.map(
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
                          className="text-xs bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 h-8"
                          maxLength={180}
                        />
                        <div className="text-right">
                          <span className={`text-xs ${
                            achievement.length > 162 
                              ? achievement.length >= 180 
                                ? 'text-red-500' 
                                : 'text-orange-500'
                              : 'text-gray-500'
                          }`}>
                            {achievement.length}/180
                          </span>
                          {achievement.length >= 180 && (
                            <span className="text-xs text-red-500 ml-1">• Limit reached</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => handleMoveAchievementUp(achievementIndex)}
                          disabled={achievementIndex === 0}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                            achievementIndex === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveAchievementDown(achievementIndex)}
                          disabled={achievementIndex === editingEducation.achievements.length - 1}
                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                            achievementIndex === editingEducation.achievements.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <Button
                          onClick={() => handleRemoveAchievement(achievementIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-5 w-5 p-0"
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
    <button className="w-full bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors duration-200">
          {education.iconName ? getIconFromName(education.iconName) : (
            <GraduationCap className="w-4 h-4 text-gray-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 font-medium text-sm">
            {education.degree}
          </div>
          <div className="text-gray-500 text-xs mt-0.5 truncate">
            {education.institution} • {education.duration}
          </div>
        </div>

        {/* View indicator */}
        <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
      </div>
    </button>
  );
};

export default function EditableEducationSection({
  education = defaultEducation,
  onEducationUpdate,
  className = "",
}: EditableEducationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEducation, setEditingEducation] =
    useState<EducationData[]>(education);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedEducation, setExpandedEducation] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const educationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleStartEdit = () => {
    setEditingEducation([...education]);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Show immediate feedback
    toast.success("Update Queued");
    
    onEducationUpdate(editingEducation);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingEducation([...education]);
    setIsEditing(false);
  };

  const handleEducationUpdate = (
    index: number,
    updatedEducation: EducationData,
  ) => {
    const updated = [...editingEducation];
    updated[index] = updatedEducation;
    setEditingEducation(updated);
  };

  const handleEducationDelete = (index: number) => {
    const updated = editingEducation.filter((_, i) => i !== index);
    setEditingEducation(updated);
  };

  const handleAddEducation = () => {
    // Check if limit is reached
    if (hasReachedLimit(editingEducation.length, 'EDUCATION')) {
      toast.error(`Maximum ${getLimit('EDUCATION')} education entries allowed.`);
      return;
    }

    const newEducation: EducationData = {
      id: `custom-${Date.now()}`,
      institution: "Institution Name",
      degree: "Degree/Certificate Title",
      duration: "",
      location: "",
      description: "",
      iconName: "GraduationCap", // Store iconName as string
      type: "degree",
      achievements: [""],
      courses: [""],
    };
    setEditingEducation([...editingEducation, newEducation]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return;

    if (index !== draggedIndex) {
      setDragOverIndex(index);

      // Reorder the array
      const newEducation = [...editingEducation];
      const draggedItem = newEducation[draggedIndex];
      newEducation.splice(draggedIndex, 1);
      newEducation.splice(index, 0, draggedItem);

      setEditingEducation(newEducation);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newEducation = [...editingEducation];
      const item = newEducation[index];
      newEducation[index] = newEducation[index - 1];
      newEducation[index - 1] = item;
      setEditingEducation(newEducation);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < editingEducation.length - 1) {
      const newEducation = [...editingEducation];
      const item = newEducation[index];
      newEducation[index] = newEducation[index + 1];
      newEducation[index + 1] = item;
      setEditingEducation(newEducation);
    }
  };

  const handleEducationExpand = (educationId: string) => {
    if (expandedEducation === educationId) {
      setExpandedEducation(null);
    } else {
      setExpandedEducation(educationId);
    }
  };

  // Auto-scroll when education expands
  useEffect(() => {
    if (expandedEducation && educationRefs.current[expandedEducation]) {
      const timer = setTimeout(() => {
        const expandedElement = educationRefs.current[expandedEducation];
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
  }, [expandedEducation]);

  // Close expandable education when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setExpandedEducation(null);
        return;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentEducation = isEditing ? editingEducation : education;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Education & Certifications
          </h2>
          <p className="text-gray-600 text-sm">
            {isEditing
              ? "Edit your education background and certifications"
              : "My educational journey and professional certifications"}
          </p>
        </div>

        <div className="ml-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <X className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                onClick={handleSave}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartEdit}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Education List */}
      <div ref={containerRef} className="space-y-2">
        {isEditing ? (
          <>
            {/* Editing Mode - Show editable items */}
            {currentEducation.map((educationItem, index) => (
              <EditableEducationItem
                key={educationItem.id}
                education={educationItem}
                isEditing={isEditing}
                index={index}
                onUpdate={(updated) => handleEducationUpdate(index, updated)}
                onDelete={() => handleEducationDelete(index)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                dragOverIndex={dragOverIndex}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < currentEducation.length - 1}
              />
            ))}

            {/* Add New Education Button */}
            <button
              onClick={handleAddEducation}
              disabled={hasReachedLimit(editingEducation.length, 'EDUCATION')}
              className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                hasReachedLimit(editingEducation.length, 'EDUCATION')
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-gray-200 text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasReachedLimit(editingEducation.length, 'EDUCATION')
                  ? `Maximum ${getLimit('EDUCATION')} education entries reached`
                  : 'Add New Education'
                }
              </span>
            </button>
          </>
        ) : (
          <>
            {/* View Mode - Show expandable education like in demo */}
            {currentEducation.map((educationItem) => (
              <div
                key={educationItem.id}
                ref={(el) => (educationRefs.current[educationItem.id] = el)}
              >
                <Education
                  education={educationItem}
                  isOpen={expandedEducation === educationItem.id}
                  onClose={() => setExpandedEducation(null)}
                  onExpand={() => handleEducationExpand(educationItem.id)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

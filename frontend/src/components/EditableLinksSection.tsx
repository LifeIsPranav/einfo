import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LIMITS, getLimit, hasReachedLimit } from "@/constants/profileLimits";
import { getIconFromName, getIconNameFromNode } from "@/lib/iconUtils";
import { ProjectLink, defaultProjects } from "@/lib/profileData";

import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface EditableLinksectionProps {
  projects?: ProjectLink[];
  onProjectsUpdate: (projects: ProjectLink[]) => void;
  className?: string;
}

interface EditableLinkItemProps {
  project: ProjectLink;
  isEditing: boolean;
  index: number;
  onUpdate: (project: ProjectLink) => void;
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

const EditableLinkItem = ({
  project,
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
}: EditableLinkItemProps) => {
  const [editingProject, setEditingProject] = useState<ProjectLink>(project);

  const handleFieldChange = (field: keyof ProjectLink, value: string) => {
    // Apply character limits
    if (field === "title" && value.length > 50) {
      return; // Don't allow input beyond 50 characters
    }
    if (field === "description" && value.length > 65) {
      return; // Don't allow input beyond 65 characters
    }
    
    const updated = { ...editingProject, [field]: value };
    setEditingProject(updated);
    onUpdate(updated);
  };

  const handleClick = () => {
    if (!isEditing && project.href) {
      window.open(project.href, "_blank", "noopener,noreferrer");
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
        className={`bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl transition-all duration-200 overflow-hidden shadow-sm ${
          isBeingDragged ? "opacity-50 scale-95" : ""
        } ${isDraggedOver ? "border-gray-300 dark:border-zinc-600 shadow-lg" : ""}`}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 space-y-3">
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
          {/* Title and URL Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Name
              </label>
              <Input
                value={editingProject.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g., LinkedIn"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={50}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingProject.title.length > 45 
                    ? editingProject.title.length >= 50 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingProject.title.length}/50 characters
                </p>
                {editingProject.title.length >= 50 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Link URL
              </label>
              <Input
                value={editingProject.href}
                onChange={(e) => handleFieldChange("href", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
              Description
            </label>
            <Input
              value={editingProject.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief description of this link"
              className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
              maxLength={65}
            />
            <div className="text-right">
              <p className={`text-xs transition-colors duration-200 ${
                editingProject.description.length > 58 
                  ? editingProject.description.length >= 65 
                    ? 'text-red-500' 
                    : 'text-orange-500'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}>
                {editingProject.description.length}/65 characters
              </p>
              {editingProject.description.length >= 65 && (
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
              selectedIcon={editingProject.icon ? getIconFromName(editingProject.icon) : null}
              onIconSelect={(icon, iconName) => {
                const updated = { ...editingProject, icon: iconName }; // Store iconName string instead of React component
                setEditingProject(updated);
                onUpdate(updated);
              }}
              placeholder="Choose an icon for this link"
            />
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
    <button
      onClick={handleClick}
      className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors duration-200">
          {project.icon ? getIconFromName(project.icon) : <ExternalLink className="w-4 h-4 text-gray-600 dark:text-zinc-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 dark:text-white font-medium text-sm transition-colors duration-200">
            {project.title}
          </div>
          {project.description && (
            <div className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 truncate transition-colors duration-200">
              {project.description}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
      </div>
    </button>
  );
};

export default function EditableLinksSection({
  projects = defaultProjects,
  onProjectsUpdate,
  className = "",
}: EditableLinksectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjects, setEditingProjects] =
    useState<ProjectLink[]>(projects);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync component state with prop changes
  useEffect(() => {
    if (projects && projects.length > 0) {
      setEditingProjects([...projects]);
    }
  }, [projects]);

  const handleStartEdit = () => {
    setEditingProjects([...projects]);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Show immediate feedback
    toast.success("Update Queued");
    
    onProjectsUpdate(editingProjects);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingProjects([...projects]);
    setIsEditing(false);
  };

  const handleProjectUpdate = (index: number, updatedProject: ProjectLink) => {
    const updated = [...editingProjects];
    updated[index] = updatedProject;
    setEditingProjects(updated);
  };

  const handleProjectDelete = (index: number) => {
    const updated = editingProjects.filter((_, i) => i !== index);
    setEditingProjects(updated);
  };

  const handleAddProject = () => {
    // Check if limit is reached
    if (hasReachedLimit(editingProjects.length, 'LINKS')) {
      toast.error(`Maximum ${getLimit('LINKS')} links allowed.`);
      return;
    }

    const newProject: ProjectLink = {
      id: `custom-${Date.now()}`,
      title: "New Link",
      description: "Brief description",
      href: "https://example.com",
      projectDetails: "Add your detailed description here...",
      icon: "ExternalLink", // Store as string name instead of React component
    };
    setEditingProjects([...editingProjects, newProject]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return;

    if (index !== draggedIndex) {
      setDragOverIndex(index);

      // Reorder the array
      const newProjects = [...editingProjects];
      const draggedItem = newProjects[draggedIndex];
      newProjects.splice(draggedIndex, 1);
      newProjects.splice(index, 0, draggedItem);

      setEditingProjects(newProjects);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newProjects = [...editingProjects];
      const item = newProjects[index];
      newProjects[index] = newProjects[index - 1];
      newProjects[index - 1] = item;
      setEditingProjects(newProjects);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < editingProjects.length - 1) {
      const newProjects = [...editingProjects];
      const item = newProjects[index];
      newProjects[index] = newProjects[index + 1];
      newProjects[index + 1] = item;
      setEditingProjects(newProjects);
    }
  };

  const currentProjects = isEditing ? editingProjects : projects;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Links</h2>
          <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-300">
            {isEditing
              ? "Edit your links and social profiles"
              : "Connect through my various platforms"}
          </p>
        </div>

        <div className="ml-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
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
              className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-2">
        {currentProjects.map((project, index) => (
          <EditableLinkItem
            key={project.id}
            project={project}
            isEditing={isEditing}
            index={index}
            onUpdate={(updated) => handleProjectUpdate(index, updated)}
            onDelete={() => handleProjectDelete(index)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={draggedIndex === index}
            dragOverIndex={dragOverIndex}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            canMoveUp={index > 0}
            canMoveDown={index < currentProjects.length - 1}
          />
        ))}

        {/* Add New Link Button */}
        {isEditing && (
          <button
            onClick={handleAddProject}
            disabled={hasReachedLimit(editingProjects.length, 'LINKS')}
            className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
              hasReachedLimit(editingProjects.length, 'LINKS')
                ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                : 'border-gray-200 text-gray-500 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">
              {hasReachedLimit(editingProjects.length, 'LINKS')
                ? `Maximum ${getLimit('LINKS')} links reached`
                : 'Add New Link'
              }
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

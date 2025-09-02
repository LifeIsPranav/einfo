import ProjectShowcase from "@/components/ProjectShowcase";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_LIMITS, getLimit, hasReachedLimit } from "@/constants/profileLimits";
import { getIconFromName, getIconNameFromNode } from "@/lib/iconUtils";

import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Eye,
  Folder,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  PortfolioProject,
  defaultPortfolioProjects,
} from "@/lib/portfolioData";

interface EditablePortfolioSectionProps {
  projects?: PortfolioProject[];
  onProjectsUpdate: (projects: PortfolioProject[]) => void;
  className?: string;
}

interface EditablePortfolioItemProps {
  project: PortfolioProject;
  isEditing: boolean;
  index: number;
  onUpdate: (project: PortfolioProject) => void;
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

const EditablePortfolioItem = ({
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
}: EditablePortfolioItemProps) => {
  const [editingProject, setEditingProject] =
    useState<PortfolioProject>(project);

  const handleFieldChange = (field: keyof PortfolioProject, value: string) => {
    // Apply character limits
    if (field === "title" && value.length > 50) {
      return; // Don't allow input beyond 50 characters
    }
    if (field === "category" && value.length > 60) {
      return; // Don't allow input beyond 60 characters
    }
    if (field === "description" && value.length > 80) {
      return; // Don't allow input beyond 80 characters
    }
    
    const updated = { ...editingProject, [field]: value };
    setEditingProject(updated);
    onUpdate(updated);
  };

  const handleImageFieldChange = (
    imageIndex: number,
    field: keyof (typeof project.images)[0],
    value: string,
  ) => {
    // Apply character limits for image fields
    if (field === "title" && value.length > 75) {
      return; // Don't allow input beyond 75 characters
    }
    if (field === "description" && value.length > 600) {
      return; // Don't allow input beyond 600 characters
    }
    
    const updatedImages = [...editingProject.images];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      [field]: value,
    };
    const updated = { ...editingProject, images: updatedImages };
    setEditingProject(updated);
    onUpdate(updated);
  };

  const handleAddImage = () => {
    // Limit to maximum 8 images
    if (editingProject.images.length >= 8) {
      return; // Don't allow more than 8 images
    }
    
    const newImage = {
      id: `image-${Date.now()}`,
      url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center",
      title: "",
      description: "",
    };
    const updated = {
      ...editingProject,
      images: [...editingProject.images, newImage],
    };
    setEditingProject(updated);
    onUpdate(updated);
  };

  const handleRemoveImage = (imageIndex: number) => {
    const updatedImages = editingProject.images.filter(
      (_, i) => i !== imageIndex,
    );
    const updated = { ...editingProject, images: updatedImages };
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
        } ${isDraggedOver ? "border-gray-300 dark:border-zinc-500 shadow-lg" : ""}`}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4 space-y-4">
          {/* Drag Handle and Move Buttons */}
          <div className="flex items-center justify-between -mt-1 mb-2">
            <div 
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 cursor-grab active:cursor-grabbing select-none hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200"
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
                className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all duration-200 ${
                  canMoveUp 
                    ? 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600' 
                    : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all duration-200 ${
                  canMoveDown 
                    ? 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600' 
                    : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-zinc-600 cursor-not-allowed'
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
                Project Title
              </label>
              <Input
                value={editingProject.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g., Mobile App Design"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={50}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingProject.title.length > 45 
                    ? editingProject.title.length >= 50 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingProject.title.length}/50 characters
                </p>
                {editingProject.title.length >= 50 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Category
              </label>
              <Input
                value={editingProject.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                placeholder="e.g., UI/UX Design"
                className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
                maxLength={60}
              />
              <div className="text-right">
                <p className={`text-xs transition-colors duration-200 ${
                  editingProject.category.length > 54 
                    ? editingProject.category.length >= 60 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}>
                  {editingProject.category.length}/60 characters
                </p>
                {editingProject.category.length >= 60 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
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
            <Input
              value={editingProject.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief project description"
              className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
              maxLength={80}
            />
            <div className="text-right">
              <p className={`text-xs transition-colors duration-200 ${
                editingProject.description.length > 72 
                  ? editingProject.description.length >= 80 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}>
                {editingProject.description.length}/80 characters
              </p>
              {editingProject.description.length >= 80 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                  Character limit reached
                </p>
              )}
            </div>
          </div>

          {/* Project URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
              Project URL (Optional)
            </label>
            <Input
              value={editingProject.href || ""}
              onChange={(e) => handleFieldChange("href", e.target.value)}
              placeholder="https://github.com/username/project"
              className="text-sm bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 font-medium transition-colors duration-200"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">Icon</label>
            <IconPicker
              selectedIcon={editingProject.iconName ? getIconFromName(editingProject.iconName) : null}
              onIconSelect={(icon, iconName) => {
                const updated = { ...editingProject, iconName }; // Store iconName string instead of React component
                setEditingProject(updated);
                onUpdate(updated);
              }}
              placeholder="Choose an icon for this project"
            />
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-colors duration-200">
                Project Images ({editingProject.images.length}/8)
              </label>
              <Button
                onClick={handleAddImage}
                variant="ghost"
                size="sm"
                disabled={editingProject.images.length >= 8}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  editingProject.images.length >= 8
                    ? 'text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                    : 'text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-zinc-100'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {editingProject.images.length >= 8 ? 'Max Reached' : 'Add Image'}
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {editingProject.images.map((image, imageIndex) => (
                <div
                  key={image.id}
                  className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 space-y-2 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 transition-colors duration-200">
                      Image {imageIndex + 1}
                    </span>
                    <Button
                      onClick={() => handleRemoveImage(imageIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 h-6 w-6 p-1 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 dark:text-zinc-400 transition-colors duration-200">Image URL</label>
                      <Input
                        value={image.url}
                        onChange={(e) =>
                          handleImageFieldChange(
                            imageIndex,
                            "url",
                            e.target.value,
                          )
                        }
                        placeholder="Image URL"
                        className="text-xs bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-7 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600 dark:text-zinc-400 transition-colors duration-200">Title</label>
                      <Input
                        value={image.title}
                        onChange={(e) =>
                          handleImageFieldChange(
                            imageIndex,
                            "title",
                            e.target.value,
                          )
                        }
                        placeholder="Image title"
                        className="text-xs bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 h-7 transition-colors duration-200"
                        maxLength={75}
                      />
                      <div className="text-right">
                        <p className={`text-xs transition-colors duration-200 ${
                          image.title.length > 67 
                            ? image.title.length >= 75 
                              ? 'text-red-500 dark:text-red-400' 
                              : 'text-orange-500 dark:text-orange-400'
                            : 'text-gray-500 dark:text-zinc-400'
                        }`}>
                          {image.title.length}/75 characters
                        </p>
                        {image.title.length >= 75 && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                            Character limit reached
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-zinc-400 transition-colors duration-200">Description</label>
                    <Textarea
                      value={image.description}
                      onChange={(e) =>
                        handleImageFieldChange(
                          imageIndex,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder="Image description"
                      className="text-xs bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 min-h-16 resize-none transition-colors duration-200"
                      maxLength={600}
                    />
                    <div className="text-right">
                      <p className={`text-xs transition-colors duration-200 ${
                        image.description.length > 540 
                          ? image.description.length >= 600 
                            ? 'text-red-500 dark:text-red-400' 
                            : 'text-orange-500 dark:text-orange-400'
                          : 'text-gray-500 dark:text-zinc-400'
                      }`}>
                        {image.description.length}/600 characters
                      </p>
                      {image.description.length >= 600 && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1 transition-colors duration-200">
                          Character limit reached
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center pt-2 border-t border-gray-100 dark:border-zinc-700 transition-colors duration-200">
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-red-600 dark:hover:bg-red-600 h-8 px-3 font-medium border border-red-200 dark:border-red-700 hover:border-red-600 dark:hover:border-red-600 transition-all duration-200"
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
      className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 dark:group-hover:bg-zinc-700 transition-colors duration-200">
          {project.iconName ? getIconFromName(project.iconName) : <Folder className="w-4 h-4 text-gray-600 dark:text-zinc-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 dark:text-zinc-100 font-medium text-sm transition-colors duration-200">
            {project.title}
          </div>
          <div className="text-gray-500 dark:text-zinc-400 text-xs mt-0.5 truncate transition-colors duration-200">
            {project.description}
          </div>
          {project.category && (
            <div className="text-gray-400 dark:text-zinc-500 text-xs mt-0.5 transition-colors duration-200">
              {project.category}
            </div>
          )}
        </div>

        {/* Arrow indicator or preview icon */}
        {project.href ? (
          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400 transition-colors duration-200" />
        ) : (
          <Eye className="w-4 h-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-400 transition-colors duration-200" />
        )}
      </div>
    </button>
  );
};

export default function EditablePortfolioSection({
  projects = defaultPortfolioProjects,
  onProjectsUpdate,
  className = "",
}: EditablePortfolioSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjects, setEditingProjects] =
    useState<PortfolioProject[]>(projects);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const handleProjectUpdate = (
    index: number,
    updatedProject: PortfolioProject,
  ) => {
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
    if (hasReachedLimit(editingProjects.length, 'PORTFOLIO')) {
      toast.error(`Maximum ${getLimit('PORTFOLIO')} portfolio projects allowed.`);
      return;
    }

    const newProject: PortfolioProject = {
      id: `custom-${Date.now()}`,
      title: "",
      description: "",
      category: "",
      href: "",
      iconName: "Folder", // Store iconName as string
      images: [
        {
          id: `image-${Date.now()}`,
          url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center",
          title: "Project Preview",
          description: "Add your project description here...",
        },
      ],
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

  const handleProjectExpand = (projectId: string, href?: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };

  const handleDirectLink = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  // Auto-scroll when project expands
  useEffect(() => {
    if (expandedProject && projectRefs.current[expandedProject]) {
      const timer = setTimeout(() => {
        const expandedElement = projectRefs.current[expandedProject];
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
  }, [expandedProject]);

  // Close expandable projects when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (containerRef.current && !containerRef.current.contains(target)) {
        setExpandedProject(null);
        return;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentProjects = isEditing ? editingProjects : projects;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-2 transition-colors duration-200">
            Portfolio
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 text-sm transition-colors duration-200">
            {isEditing
              ? "Edit your portfolio projects and showcases"
              : "Explore my latest projects and creative work"}
          </p>
        </div>

        <div className="ml-4">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
              </Button>
              <Button
                onClick={handleSave}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-2 rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartEdit}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Portfolio List */}
      <div ref={containerRef} className="space-y-2">
        {isEditing ? (
          <>
            {/* Editing Mode - Show editable items */}
            {currentProjects.map((project, index) => (
              <EditablePortfolioItem
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

            {/* Add New Project Button */}
            <button
              onClick={handleAddProject}
              disabled={hasReachedLimit(editingProjects.length, 'PORTFOLIO')}
              className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                hasReachedLimit(editingProjects.length, 'PORTFOLIO')
                  ? 'border-gray-100 dark:border-zinc-700 text-gray-300 dark:text-zinc-600 cursor-not-allowed bg-gray-50 dark:bg-zinc-800'
                  : 'border-gray-200 dark:border-zinc-600 text-gray-500 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {hasReachedLimit(editingProjects.length, 'PORTFOLIO')
                  ? `Maximum ${getLimit('PORTFOLIO')} projects reached`
                  : 'Add New Project'
                }
              </span>
            </button>
          </>
        ) : (
          <>
            {/* View Mode - Show expandable showcases like in demo */}
            {currentProjects.map((project) => (
              <div
                key={project.id}
                ref={(el) => (projectRefs.current[project.id] = el)}
              >
                <ProjectShowcase
                  project={project}
                  isOpen={expandedProject === project.id}
                  onClose={() => setExpandedProject(null)}
                  onExpand={() => handleProjectExpand(project.id, project.href)}
                  onDirectLink={() =>
                    project.href && handleDirectLink(project.href)
                  }
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

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
                Project Title
              </label>
              <Input
                value={editingProject.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g., Mobile App Design"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={50}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingProject.title.length > 45 
                    ? editingProject.title.length >= 50 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
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
              <label className="text-xs font-semibold text-gray-800">
                Category
              </label>
              <Input
                value={editingProject.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                placeholder="e.g., UI/UX Design"
                className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
                maxLength={60}
              />
              <div className="text-right">
                <p className={`text-xs ${
                  editingProject.category.length > 54 
                    ? editingProject.category.length >= 60 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
                  {editingProject.category.length}/60 characters
                </p>
                {editingProject.category.length >= 60 && (
                  <p className="text-xs text-red-500 mt-1">
                    Character limit reached
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">
              Description
            </label>
            <Input
              value={editingProject.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Brief project description"
              className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
              maxLength={80}
            />
            <div className="text-right">
              <p className={`text-xs ${
                editingProject.description.length > 72 
                  ? editingProject.description.length >= 80 
                    ? 'text-red-500' 
                    : 'text-orange-500'
                  : 'text-gray-500'
              }`}>
                {editingProject.description.length}/80 characters
              </p>
              {editingProject.description.length >= 80 && (
                <p className="text-xs text-red-500 mt-1">
                  Character limit reached
                </p>
              )}
            </div>
          </div>

          {/* Project URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">
              Project URL (Optional)
            </label>
            <Input
              value={editingProject.href || ""}
              onChange={(e) => handleFieldChange("href", e.target.value)}
              placeholder="https://github.com/username/project"
              className="text-sm bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 font-medium"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-800">Icon</label>
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
              <label className="text-xs font-semibold text-gray-800">
                Project Images ({editingProject.images.length}/8)
              </label>
              <Button
                onClick={handleAddImage}
                variant="ghost"
                size="sm"
                disabled={editingProject.images.length >= 8}
                className={`h-7 px-2 text-xs ${
                  editingProject.images.length >= 8
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800'
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
                  className="bg-gray-50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Image {imageIndex + 1}
                    </span>
                    <Button
                      onClick={() => handleRemoveImage(imageIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Image URL</label>
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
                        className="text-xs bg-white border-gray-300 text-gray-900 placeholder-gray-400 h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Title</label>
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
                        className="text-xs bg-white border-gray-300 text-gray-900 placeholder-gray-400 h-7"
                        maxLength={75}
                      />
                      <div className="text-right">
                        <p className={`text-xs ${
                          image.title.length > 67 
                            ? image.title.length >= 75 
                              ? 'text-red-500' 
                              : 'text-orange-500'
                            : 'text-gray-500'
                        }`}>
                          {image.title.length}/75 characters
                        </p>
                        {image.title.length >= 75 && (
                          <p className="text-xs text-red-500 mt-1">
                            Character limit reached
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Description</label>
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
                      className="text-xs bg-white border-gray-300 text-gray-900 placeholder-gray-400 min-h-16 resize-none"
                      maxLength={600}
                    />
                    <div className="text-right">
                      <p className={`text-xs ${
                        image.description.length > 540 
                          ? image.description.length >= 600 
                            ? 'text-red-500' 
                            : 'text-orange-500'
                          : 'text-gray-500'
                      }`}>
                        {image.description.length}/600 characters
                      </p>
                      {image.description.length >= 600 && (
                        <p className="text-xs text-red-500 mt-1">
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
      className="w-full bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all duration-200 group shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4 text-left">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors duration-200">
          {project.iconName ? getIconFromName(project.iconName) : <Folder className="w-4 h-4 text-gray-600" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 font-medium text-sm">
            {project.title}
          </div>
          <div className="text-gray-500 text-xs mt-0.5 truncate">
            {project.description}
          </div>
          {project.category && (
            <div className="text-gray-400 text-xs mt-0.5">
              {project.category}
            </div>
          )}
        </div>

        {/* Arrow indicator or preview icon */}
        {project.href ? (
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
        ) : (
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Portfolio
          </h2>
          <p className="text-gray-600 text-sm">
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
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-gray-200 text-gray-500 hover:text-gray-600 hover:border-gray-300'
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

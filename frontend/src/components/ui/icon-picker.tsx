import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  // Common icons
  ExternalLink,
  Briefcase,
  Folder,
  Home,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  Eye,
  Search,
  Settings,
  // Social & Platform icons
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  // Design & Creative
  Palette,
  Paintbrush,
  Camera,
  Film,
  Image,
  Pen,
  PenTool,
  // Tech & Development
  Code,
  Database,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  // Business & Work
  Building,
  Building2,
  Users,
  UserCheck,
  Trophy,
  Award,
  Target,
  TrendingUp,
  BarChart,
  PieChart,
  // Tools & Objects
  Wrench,
  Hammer,
  Scissors,
  Ruler,
  Calculator,
  Book,
  FileText,
  // Actions & Arrows
  Play,
  Pause,
  Download,
  Upload,
  Share,
  Send,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  // Misc
  Zap,
  Rocket,
  Shield,
  Lock,
  Unlock,
  Check,
  X,
  Plus,
  Minus,
} from "lucide-react";

export interface IconOption {
  name: string;
  icon: React.ReactNode;
  category: string;
}

export const iconOptions: IconOption[] = [
  // Common
  {
    name: "ExternalLink",
    icon: <ExternalLink className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Briefcase",
    icon: <Briefcase className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Folder",
    icon: <Folder className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Home",
    icon: <Home className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "User",
    icon: <User className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Mail",
    icon: <Mail className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Phone",
    icon: <Phone className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Globe",
    icon: <Globe className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "MapPin",
    icon: <MapPin className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Calendar",
    icon: <Calendar className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Clock",
    icon: <Clock className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Star",
    icon: <Star className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Heart",
    icon: <Heart className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Eye",
    icon: <Eye className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Search",
    icon: <Search className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },
  {
    name: "Settings",
    icon: <Settings className="w-4 h-4 text-gray-700" />,
    category: "Common",
  },

  // Social & Platform
  {
    name: "Github",
    icon: <Github className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },
  {
    name: "Twitter",
    icon: <Twitter className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },
  {
    name: "Linkedin",
    icon: <Linkedin className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },
  {
    name: "Instagram",
    icon: <Instagram className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },
  {
    name: "Facebook",
    icon: <Facebook className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },
  {
    name: "Youtube",
    icon: <Youtube className="w-4 h-4 text-gray-700" />,
    category: "Social",
  },

  // Design & Creative
  {
    name: "Palette",
    icon: <Palette className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "Paintbrush",
    icon: <Paintbrush className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "Camera",
    icon: <Camera className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "Film",
    icon: <Film className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "Image",
    icon: <Image className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "Pen",
    icon: <Pen className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },
  {
    name: "PenTool",
    icon: <PenTool className="w-4 h-4 text-gray-700" />,
    category: "Design",
  },

  // Tech & Development
  {
    name: "Code",
    icon: <Code className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Database",
    icon: <Database className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Monitor",
    icon: <Monitor className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Smartphone",
    icon: <Smartphone className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Tablet",
    icon: <Tablet className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Laptop",
    icon: <Laptop className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Server",
    icon: <Server className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },
  {
    name: "Cloud",
    icon: <Cloud className="w-4 h-4 text-gray-700" />,
    category: "Tech",
  },

  // Business & Work
  {
    name: "Building",
    icon: <Building className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "Building2",
    icon: <Building2 className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "Users",
    icon: <Users className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "UserCheck",
    icon: <UserCheck className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "Trophy",
    icon: <Trophy className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "Award",
    icon: <Award className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "Target",
    icon: <Target className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "TrendingUp",
    icon: <TrendingUp className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "BarChart",
    icon: <BarChart className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },
  {
    name: "PieChart",
    icon: <PieChart className="w-4 h-4 text-gray-700" />,
    category: "Business",
  },

  // Tools & Objects
  {
    name: "Wrench",
    icon: <Wrench className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "Hammer",
    icon: <Hammer className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "Scissors",
    icon: <Scissors className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "Ruler",
    icon: <Ruler className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "Calculator",
    icon: <Calculator className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "Book",
    icon: <Book className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },
  {
    name: "FileText",
    icon: <FileText className="w-4 h-4 text-gray-700" />,
    category: "Tools",
  },

  // Actions & Arrows
  {
    name: "Play",
    icon: <Play className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "Pause",
    icon: <Pause className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "Download",
    icon: <Download className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "Upload",
    icon: <Upload className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "Share",
    icon: <Share className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "Send",
    icon: <Send className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "ArrowRight",
    icon: <ArrowRight className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "ArrowLeft",
    icon: <ArrowLeft className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "ArrowUp",
    icon: <ArrowUp className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },
  {
    name: "ArrowDown",
    icon: <ArrowDown className="w-4 h-4 text-gray-700" />,
    category: "Actions",
  },

  // Misc
  {
    name: "Zap",
    icon: <Zap className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Rocket",
    icon: <Rocket className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Shield",
    icon: <Shield className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Lock",
    icon: <Lock className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Unlock",
    icon: <Unlock className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Check",
    icon: <Check className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "X",
    icon: <X className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Plus",
    icon: <Plus className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
  {
    name: "Minus",
    icon: <Minus className="w-4 h-4 text-gray-700" />,
    category: "Misc",
  },
];

interface IconPickerProps {
  selectedIcon?: React.ReactNode;
  onIconSelect: (icon: React.ReactNode, iconName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function IconPicker({
  selectedIcon,
  onIconSelect,
  placeholder = "Select an icon",
  disabled = false,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(iconOptions.map((icon) => icon.category))),
  ];

  const filteredIcons = iconOptions.filter((icon) => {
    const matchesSearch = icon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleIconSelect = (icon: IconOption) => {
    onIconSelect(icon.icon, icon.name);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-100"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <div className="w-4 h-4 flex items-center justify-center text-gray-700">
                  {selectedIcon}
                </div>
                <span className="text-sm text-gray-900">Selected Icon</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="w-4 h-4 flex items-center justify-center">
            <Search className="w-3 h-3 text-gray-500" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white border-gray-200 text-gray-900"
        align="start"
      >
        <div className="space-y-3 p-3 bg-white">
          {/* Search */}
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm h-8 bg-white border-gray-200 text-gray-900 placeholder-gray-500"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`h-6 px-2 text-xs ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <ScrollArea className="h-48 bg-white">
          <div className="grid grid-cols-8 gap-1 p-3 pt-0 bg-white">
            {filteredIcons.map((iconOption) => (
              <Button
                key={iconOption.name}
                variant="ghost"
                size="sm"
                onClick={() => handleIconSelect(iconOption)}
                className="h-8 w-8 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 flex items-center justify-center border-0"
                title={iconOption.name}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {iconOption.icon}
                </div>
              </Button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4 bg-white">
              No icons found
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

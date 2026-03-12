import {
  UserDashboardResponse,
  UsersResponseDto,
  UserStatsResponse,
} from "@/api/types/user.types";

export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  trendLabel?: string;
}

export interface UserListProps {
  users: UsersResponseDto["data"];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
  totalUsers: number;
  isRefreshing?: boolean;
}

export interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userData: UserDashboardResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onUploadSuccess: () => void;
}

export interface RecentActivityProps {
  users: UserStatsResponse["recent"]["users"];
  admins: UserStatsResponse["recent"]["admins"];
  isLoading?: boolean;
}

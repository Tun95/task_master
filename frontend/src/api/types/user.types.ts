export interface CompanyData {
  id: string;
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
  percentage: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDataDto {
  companyName: string;
  numberOfUsers: number;
  numberOfProducts: number;
}

export interface Image {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  uploadedAt: string;
}

export interface UserDashboardResponse {
  user: {
    id: string;
    name: string;
    email: string;
    memberSince: string;
  };
  mostRecentSubmission: {
    id: string;
    companyName: string;
    numberOfUsers: number;
    numberOfProducts: number;
    percentage: number;
    submittedAt: string;
  } | null;
  recentImage: {
    id: string;
    url: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string;
  } | null;
  hasData: boolean;
  hasImage: boolean;
}

export interface UploadImageResponse {
  message: string;
  image: {
    id: string;
    url: string;
    filename: string;
    uploadedAt: string;
  };
}

export enum Platform {
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  YOUTUBE = 'YouTube',
  TIKTOK = 'TikTok',
}

export enum PostType {
  FEED = 'Feed',
  REELS = 'Reels',
  STORY = 'Story',
}

export interface MediaItem {
  id: string;
  url: string; // Base64 Data URL (potencialmente recortada ou editada)
  originalUrl: string; // A URL de dados Base64 original antes de qualquer modificação
  type: string; // ex: 'image/png', 'video/mp4'
  aspectRatio: number; // A proporção em que foi recortada, ex: 1, 0.8, 1.77
  needsCrop?: boolean; // Sinalizador para forçar o recorte
  edits?: { // Novo campo para o editor de imagem
    brightness: number; // 0 a 200, padrão 100
    contrast: number;   // 0 a 200, padrão 100
    saturate: number;   // 0 a 200, padrão 100
    blur: number;       // 0 a 10 (pixels), padrão 0
    filter: 'none' | 'grayscale' | 'sepia' | 'invert';
  };
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledAt: string; // ISO string
  status: 'scheduled' | 'published';
  postType: PostType;
  media: MediaItem[];
}

export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string;
}

export interface Suggestion {
  title: string;
  copy: string;
}

export enum View {
    CALENDAR = 'calendar',
    LIST = 'list',
}

export interface UserData {
  fullName: string;
  email: string;
  birthDate: string; // YYYY-MM-DD
  geminiApiKey?: string;
  geminiApiKeyTestStatus?: 'untested' | 'valid' | 'invalid';
}

export interface PaymentData {
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  cardNumber?: string;
}

export type PackageTier = 0 | 1 | 2 | 3 | 4;

export interface Subscription {
  package: PackageTier;
  hasAiAddon: boolean;
}

// Admin Panel Types
export enum ClientStatus {
  ACTIVE = 'Ativo',
  PAUSED = 'Pausado',
  BLOCKED = 'Bloqueado',
  IN_DEFAULT = 'Inadimplente',
}

export interface Client {
  id: string;
  status: ClientStatus;
  userData: UserData;
  paymentData: PaymentData;
  subscription: Subscription;
  imageGenerationCount: number;
}

export interface AlertContact {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
}
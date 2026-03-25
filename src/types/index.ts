export type CompetitionStatus = 'open' | 'soon' | 'closed' | 'past'
export type CompetitionRegion = 'uae' | 'europe' | 'qatar' | 'other'
export type BookingPackage = 'photos' | 'reel' | 'bundle'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type EnquiryStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'declined'
export type BrandStatus = 'new' | 'contacted' | 'onboarded' | 'declined'
export type MessageStatus = 'unread' | 'read' | 'replied'
export type PortfolioCategory = 'competition' | 'private' | 'reel'

export interface Competition {
  id: string
  name: string
  location: string
  country: string
  region: CompetitionRegion
  event_date: string
  status: CompetitionStatus
  event_type: string
  booking_deadline?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CompetitionBooking {
  id: string
  competition_id: string
  competition?: Competition
  first_name: string
  last_name: string
  email: string
  horse_name: string
  class_round?: string
  package: BookingPackage
  package_price?: number
  status: BookingStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface ShootEnquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  shoot_type: string
  preferred_date?: string
  location?: string
  vision?: string
  status: EnquiryStatus
  created_at: string
  updated_at: string
}

export interface BrandEnquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  brand_name: string
  instagram_handle?: string
  service_interest: string
  message?: string
  status: BrandStatus
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  source?: string
  status: MessageStatus
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  title: string
  category: PortfolioCategory
  image_url?: string
  video_url?: string
  thumbnail_url?: string
  storage_path?: string
  is_featured: boolean
  sort_order: number
  alt_text?: string
  created_at: string
  updated_at: string
}

export const PACKAGE_PRICES: Record<BookingPackage, number> = {
  photos: 350,
  reel: 450,
  bundle: 700,
}

export const PACKAGE_LABELS: Record<BookingPackage, string> = {
  photos: 'Photos',
  reel: 'Reel',
  bundle: 'Photos + Reel',
}

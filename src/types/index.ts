// Domain model shared by services, seed script and the match engine.
// Phase 2 (Supabase / Flutter) should port these types 1:1.

export type Role = 'adopter' | 'owner' | 'admin';
export type Species = 'perro' | 'gato';
export type Size = 'S' | 'M' | 'L';
export type Sex = 'macho' | 'hembra';
export type PetStatus = 'disponible' | 'adoptada' | 'retirada';
export type ApprovalStatus = 'pendiente' | 'aprobada' | 'rechazada';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface District extends GeoPoint {
  name: string;
}

export type Housing = 'departamento' | 'casa_sin_patio' | 'casa_con_patio';
export type HomeSize = 'pequena' | 'mediana' | 'grande';
export type HoursAlone = '0-2' | '3-5' | '6-8' | '8+';
export type Activity = 'sedentario' | 'moderado' | 'muy_activo';
export type Experience = 'primera' | 'he_tenido' | 'experto';
export type Kids = 'no' | 'mayores_6' | 'pequenos';
export type OtherPets = 'ninguna' | 'perro' | 'gato' | 'ambos';
export type AgePref = 'cachorro' | 'joven' | 'adulto' | 'senior';

/** Answers of the Bumble-style onboarding questionnaire (motor_match.md "Entradas"). */
export interface AdopterProfile {
  district: string;
  location: GeoPoint;
  radiusKm: number;
  housing: Housing;
  homeSize: HomeSize;
  hoursAlone: HoursAlone;
  activity: Activity;
  experience: Experience;
  kids: Kids;
  otherPets: OtherPets;
  allergies: boolean;
  prefs: {
    species: Species[]; // empty = both
    sizes: Size[]; // empty = any
    ages: AgePref[]; // empty = any
    sex: Sex | 'cualquiera';
  };
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string; // demo only: plain text in localStorage, never do this with a real backend
  avatar: string;
  phone?: string;
  district?: string;
  bio?: string;
  active: boolean;
  createdAt: string;
  provider?: 'email' | 'google';
  /** Owners only */
  kind?: 'persona' | 'albergue';
  autoAcceptProbability?: number;
  /** Adopters only */
  profile?: AdopterProfile;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed: string;
  ageMonths: number;
  size: Size;
  sex: Sex;
  energy: number; // 1-5
  goodWithKids: boolean;
  goodWithDogs: boolean;
  goodWithCats: boolean;
  needsYard: boolean;
  aloneTolerance: number; // 1-5
  firstTimerFriendly: boolean;
  hypoallergenic: boolean;
  sterilized: boolean;
  vaccinated: boolean;
  dewormed: boolean;
  district: string;
  location: GeoPoint;
  personality: string[];
  about: string;
  story?: string;
  specialCare?: string;
  photos: string[];
  status: PetStatus;
  approval: ApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface Reason {
  factor: MatchFactor;
  icon: string;
  text: string;
  points: number;
}

export type MatchFactor =
  | 'distance'
  | 'housing'
  | 'lifestyle'
  | 'time'
  | 'home'
  | 'experience'
  | 'preferences';

export interface MatchResult {
  score: number; // 0-100
  reasons: Reason[];
  warnings: Reason[];
  hardBlock?: string;
  distanceKm: number;
  breakdown: Record<MatchFactor, number>;
}

export type InteractionKind = 'like' | 'dislike' | 'superlike';

export interface Interaction {
  id: string;
  adopterId: string;
  petId: string;
  kind: InteractionKind;
  createdAt: string;
}

export type InterestStatus = 'pendiente' | 'aceptado' | 'rechazado';

/** A like waiting for the owner's answer. Accepted interest == Match (HU-07). */
export interface Interest {
  id: string;
  adopterId: string;
  petId: string;
  ownerId: string;
  status: InterestStatus;
  super: boolean;
  score: number;
  createdAt: string;
  answeredAt?: string;
}

export interface Match {
  id: string;
  adopterId: string;
  petId: string;
  ownerId: string;
  score: number;
  createdAt: string;
  seen: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
  system?: boolean;
}

export interface ChatThread {
  id: string;
  kind: 'direct' | 'group';
  petId: string;
  memberIds: string[];
  createdAt: string;
  lastReadAt: Record<string, string>;
}

export type AdoptionStatus = 'pendiente' | 'aceptada' | 'rechazada';

export interface AdoptionRequest {
  id: string;
  adopterId: string;
  petId: string;
  ownerId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  place: string;
  message: string;
  status: AdoptionStatus;
  createdAt: string;
}

export type NotificationKind =
  | 'interes'
  | 'match'
  | 'mensaje'
  | 'solicitud'
  | 'solicitud_respuesta'
  | 'publicacion'
  | 'sistema';

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string;
  actorId?: string;
  petId?: string;
  read: boolean;
  createdAt: string;
}

export type ReportStatus = 'abierto' | 'resuelto' | 'descartado';

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'mascota' | 'usuario' | 'mensaje';
  targetId: string;
  reason: string;
  detail: string;
  status: ReportStatus;
  createdAt: string;
  resolution?: string;
}

export interface Favorite {
  adopterId: string;
  petId: string;
  createdAt: string;
}

export interface SeedData {
  users: User[];
  pets: Pet[];
  interactions: Interaction[];
  interests: Interest[];
  matches: Match[];
  threads: ChatThread[];
  messages: ChatMessage[];
  adoptions: AdoptionRequest[];
  notifications: AppNotification[];
  reports: Report[];
  favorites: Favorite[];
}

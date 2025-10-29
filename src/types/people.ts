export interface Question {
  q: string;
  a: string;
}

export interface CTA {
  label: string;
  action?: string;
  url?: string;
}

export interface Person {
  name: string;
  bio: string;
  claim: string;
  tags: string[];
  offer: string;
  questions: Question[];
  cta: CTA[];
  category: "Konventionell" | "Brüche" | "Radikal";
  isSpotlight?: boolean;
  profileImage?: string;
}

export interface FilterOptions {
  lebensziel: string;
  branche: string;
  erfahrung: string;
}

export interface QuestionSubmission {
  userName: string;
  userEmail: string;
  questionText: string;
  targetPerson: string;
}

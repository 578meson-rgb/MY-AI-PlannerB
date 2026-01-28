
export interface Chapter {
  id: string;
  name: string;
}

export interface Paper {
  name: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  papers: {
    first: Paper;
    second: Paper;
  };
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface UserPlanRequest {
  selectedChapters: {
    subjectId: string;
    paper: 'first' | 'second';
    chapterNames: string[];
  }[];
  examDate: string;
  dailyHours: number;
  confidence: ConfidenceLevel;
}

export interface Publication {
  id: string;
  title: string;
  doi: string;
  url?: string;
  datePublished?: string;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  hIndex?: number;
  researchInterests: string[];
  awards: string[];
  publications: Publication[];
  socialLinks: {
    orcid?: string;
    googleScholar?: string;
    linkedIn?: string;
    github?: string;
  };
  isPublic: boolean;
}

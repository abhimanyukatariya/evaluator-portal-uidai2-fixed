export type StartupLite = {
  id: string;
  name: string;
  city: string;
  industry: string;
  trl: string;          
  website?: string;
};

export type UploadRef = { name: string; url: string };

export type AppField = {
  key: string;
  label: string;
  value: string | string[];
};

export type AppSection = {
  title: string;
  fields: AppField[];
};

export type StartupApplication = {
  slug: string;              
  startup: StartupLite;
  summary?: string;
  sections: AppSection[];
  uploads: UploadRef[];
};

export type StartupLite = {
  id: string;
  name: string;
  city: string;
  industry: string;
  trl: string;          // e.g. "TRL 6"
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
  slug: string;              // challenge slug: face-liveness, contactless-fingerprint, etc.
  startup: StartupLite;
  summary?: string;
  sections: AppSection[];
  uploads: UploadRef[];
};

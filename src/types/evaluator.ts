export type EvaluatorAppRow = {
  id: string;                 // application id (or startup id)
  startup_id?: string;
  startup_name?: string;
  name?: string;              // sometimes name is here
  city?: string | null;
  stage?: string | null;
  status?: string | null;
  submitted_at?: string | null;
};

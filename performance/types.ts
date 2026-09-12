export interface PerfSeedManifest {
  createdAt: string;
  companyIds: string[];
  jobIds: string[];
  studentUserIds: string[];
  studentProfileIds: string[];
  applicationIds: string[];
  feedJobId: string | null;
}

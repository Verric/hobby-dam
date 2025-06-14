export interface DashboardDocument {
  organisationId: string;
  totals: {
    totalAssets: number;
  };
  fileExtensions: {
    extension: string;
    count: number;
  }[];
}

export interface AssetReportDocument {
  assetId: string;
  organisationId: string;
  createdById: string;
  name: string;
  mimeType: string;
  sizeInBytes: number;
  fileExtension: string;
  storageBackend: string;
  tags: string[];
  createdAt: string;
  eventTimestamp: string;
}

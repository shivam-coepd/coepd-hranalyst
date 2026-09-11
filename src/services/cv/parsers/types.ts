export interface CvParseResult {
  text: string;

  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
  };
}
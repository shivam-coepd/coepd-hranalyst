import { S3Client } from "@aws-sdk/client-s3";

const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/s3`;

export const s3Client = new S3Client({
  forcePathStyle: true,
  region: "us-east-1",
  endpoint,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY || "missing_key",
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY || "missing_secret",
  },
});

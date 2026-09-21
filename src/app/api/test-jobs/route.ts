import { NextResponse } from 'next/server';
import { getJobs } from '@/repositories/jobs.repository';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get('companyId') || undefined;
  
  try {
    const result = await getJobs({ companyId });
    return NextResponse.json({
      count: result.jobs.length,
      jobs: result.jobs.map(j => ({ id: j.id, company_id: j.companies?.id || (j as any).company_id }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

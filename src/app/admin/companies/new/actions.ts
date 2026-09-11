"use server";
import { redirect } from "next/navigation"; import { createCompany } from "@/services/companies/company.service";
type State={success:boolean;message:string};
export async function createCompanyAction(_:State,fd:FormData):Promise<State>{try{const c=await createCompany(Object.fromEntries(fd.entries()) as any);redirect(`/admin/companies/${c.id}`)}catch(e){return{success:false,message:e instanceof Error?e.message:"Unable to create company"}}}

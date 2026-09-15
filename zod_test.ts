import { companySchema } from "./src/lib/validators/company.schema";

const fd = new FormData();
fd.append("companyName", "Test Co");
// If fd has missing optional strings, what happens when we parse Object.fromEntries?
const obj = Object.fromEntries(fd.entries());

const res = companySchema.safeParse(obj);
if (!res.success) {
  console.log(res.error.issues);
} else {
  console.log("Success:", res.data);
}

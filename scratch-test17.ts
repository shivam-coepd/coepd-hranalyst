import { processNotificationOutbox } from "./src/services/notifications/notification-worker.service";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  try {
    const res = await processNotificationOutbox();
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();

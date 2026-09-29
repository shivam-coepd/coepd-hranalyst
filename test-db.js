const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://jeyhyaevztvuevombsom.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleWh5YWV2enR2dWV2b21ic29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg0NDMzNCwiZXhwIjoyMTA0NDIwMzM0fQ.i-5WZEAUC5exWRhqNo4EjcBiiaJHID8tMa-_y3HF8bA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("student_profiles").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", data[0]);
  }
}

test();

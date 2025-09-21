import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.auth.signUp({
    email: "test@example.com",
    password: "password123",
  });

  console.log({ data, error });
})();
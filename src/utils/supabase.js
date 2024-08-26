// enable us to make api call to backend

import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseClient = async (supabaseAccessToken) => {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
          headers: {
          //apikey: supabaseKey,
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });

  return supabase;
};

export default supabaseClient;

// we often use clerk for google authentication or login/signup

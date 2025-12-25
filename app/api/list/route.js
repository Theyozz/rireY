import { supabase } from "../../../lib/supabaseClient";

export const GET = async () => {
    const { data, error } = await supabase.from("rires").select("*").order("inserted_at", { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
};

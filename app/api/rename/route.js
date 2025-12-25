import { supabase } from "../../../lib/supabaseClient";

export const POST = async (req) => {
    const { id, newName } = await req.json();

    const { error } = await supabase
        .from("rires")
        .update({ name: newName })
        .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
};

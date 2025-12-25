import { supabase } from "../../../lib/supabaseClient";

export const POST = async (req) => {
    const { id, path } = await req.json();

    // delete file from storage
    await supabase.storage.from("rires").remove([path]);

    // delete from db
    const { error } = await supabase.from("rires").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ success: true });
};

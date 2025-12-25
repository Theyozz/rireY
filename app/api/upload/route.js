import { supabase } from "../../../lib/supabaseClient";

export const POST = async (req) => {
    const data = await req.formData();
    const file = data.get("file");
    const fileName = file.name;
    const path = `${Date.now()}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("rires")
        .upload(path, file);

    if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    const publicUrl = supabase
        .storage
        .from("rires")
        .getPublicUrl(path).data.publicUrl;

    // Insert into DB
    const { error: dbError } = await supabase
        .from("rires")
        .insert([{ name: fileName.replace(/\\.(mp3|m4a)$/i, ""), url: publicUrl }]);

    if (dbError) return Response.json({ error: dbError.message }, { status: 500 });

    return Response.json({ url: publicUrl });
};

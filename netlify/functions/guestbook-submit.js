const { createClient } = require("@supabase/supabase-js");

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function (event) {
    // Preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: "",
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ ok: false, error: "Method not allowed" }),
        };
    }

    try {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing Supabase env vars");
        }

        const supabase = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        );

        const body = JSON.parse(event.body || "{}");

        const message = String(body.message ?? body.note ?? "").trim();

        const payload = {
            name: body.name || "Anonymous",
            message,
            mood: body.mood || null,
            bg: body.bg || null,
            avatar: body.avatar || null,
            created_at: new Date().toISOString(),
        };

        if (!payload.message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ ok: false, error: "Message required" }),
            };
        }


        if (!payload.message.trim()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ ok: false, error: "Message required" }),
            };
        }

        const { error } = await supabase
            .from("guestbook")
            .insert([payload]);

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ ok: true }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                ok: false,
                error: err.message || String(err),
            }),
        };
    }
};

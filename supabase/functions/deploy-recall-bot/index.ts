import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RECALL_API_TOKEN = "eb41c5c381117c51feca8d3b4fbc6f926f2b811d";
const RECALL_API_URL = "https://us-west-2.recall.ai/api/v1/bot";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { meeting_url } = await req.json();

    if (!meeting_url) {
      return new Response(
        JSON.stringify({ error: "meeting_url is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const recallResponse = await fetch(RECALL_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Token ${RECALL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_url,
        recording_config: {
          transcript: {
            provider: {
              recallai_streaming: {
                mode: "prioritize_low_latency",
                language_code: "en",
              },
            },
          },
        },
      }),
    });

    if (!recallResponse.ok) {
      const errorText = await recallResponse.text();
      throw new Error(`Recall API error: ${recallResponse.status} - ${errorText}`);
    }

    const data = await recallResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        bot_id: data.id,
        status: data.status_changes?.[0]?.code || "created",
        meeting_url: data.meeting_url,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to deploy bot",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
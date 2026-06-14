import type { Config } from "@netlify/functions";
import { Resend } from "resend";
import { getServiceSupabase } from "./_supabase";

const MAX_EMAILS = 80;

export default async function handler() {
  try {
    const supabase = getServiceSupabase();
    const resendKey = process.env.RESEND_API_KEY;
    const resend = resendKey ? new Resend(resendKey) : null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://the-velvet.netlify.app";

    const { data: users } = await supabase
      .from("profiles")
      .select("id, username, full_name, weekly_reach, email_digest_enabled")
      .gt("weekly_reach", 0)
      .eq("email_digest_enabled", true)
      .limit(MAX_EMAILS);

    let emailsSent = 0;
    let notificationsCreated = 0;

    for (const user of users ?? []) {
      const views = user.weekly_reach ?? 0;

      const { data: topBoard } = await supabase
        .from("boards")
        .select("title, weekly_view_count")
        .eq("owner_id", user.id)
        .eq("is_public", true)
        .is("deleted_at", null)
        .order("weekly_view_count", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.from("notifications").insert({
        recipient_id: user.id,
        type: "weekly_digest",
        title: "Your weekly creator recap",
        body: `Your boards were seen by ${views} people this week.`,
        metadata: {
          views,
          top_board: topBoard?.title ?? null,
          top_board_views: topBoard?.weekly_view_count ?? 0,
        },
      });
      notificationsCreated++;

      if (resend && emailsSent < MAX_EMAILS) {
        const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
        const email = authUser?.user?.email;
        if (email) {
          await resend.emails.send({
            from: "Velvet <hello@velvet.app>",
            to: email,
            subject: `Your Velvet week — ${views} people discovered your boards`,
            html: `
              <p>This week, your boards were seen by <strong>${views}</strong> people.</p>
              ${topBoard ? `<p>Your top board: <strong>${topBoard.title}</strong> (${topBoard.weekly_view_count ?? 0} views)</p>` : ""}
              <p><a href="${appUrl}/insights?utm_source=velvet&utm_medium=email&utm_campaign=weekly_digest&utm_content=${encodeURIComponent(user.id)}">See your full insights →</a></p>
            `,
          });
          emailsSent++;
        }
      }
    }

    console.log(`weekly-digest: ${notificationsCreated} notifications, ${emailsSent} emails`);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("weekly-digest failed:", err);
    return new Response("Error", { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 12 * * 0",
};

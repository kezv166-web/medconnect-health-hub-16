import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: EmailRequest = await req.json();
    console.log("Sending medicine email for user:", userId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get patient profile
    const { data: profile, error: profileError } = await supabase
      .from("patient_profiles")
      .select("email, full_name, email_notifications_enabled, id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.email_notifications_enabled) {
      console.log("Email notifications disabled for user");
      return new Response(
        JSON.stringify({ message: "Email notifications disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For testing with Resend's free tier, use the verified email
    // In production, you would verify a domain and use the patient's actual email
    const recipientEmail = profile.email;
    const isTestMode = recipientEmail !== "kezv166@gmail.com";
    
    if (isTestMode) {
      console.log(`Test mode: Sending to verified email instead of ${recipientEmail}`);
    }

    // Get today's and tomorrow's dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch medicine schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("medicine_schedules")
      .select("*")
      .eq("patient_id", profile.id);

    if (schedulesError) {
      console.error("Error fetching schedules:", schedulesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch schedules" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch intake logs for today
    const { data: intakeLogs } = await supabase
      .from("intake_logs")
      .select("schedule_id, taken_at")
      .eq("log_date", todayStr);

    const takenScheduleIds = new Set(intakeLogs?.map(log => log.schedule_id) || []);

    // Group schedules by time slot
    const todayRemaining = schedules?.filter(s => !takenScheduleIds.has(s.id)) || [];
    const tomorrowSchedules = schedules || [];

    const timeSlots = {
      morning: { label: "Morning (6 AM - 12 PM)", items: [] as any[] },
      afternoon: { label: "Afternoon (12 PM - 4 PM)", items: [] as any[] },
      evening: { label: "Evening (4 PM - 8 PM)", items: [] as any[] },
      night: { label: "Night (8 PM - 6 AM)", items: [] as any[] }
    };

    // Categorize remaining today's medicines
    todayRemaining.forEach(schedule => {
      const slot = timeSlots[schedule.time_slot as keyof typeof timeSlots];
      if (slot) slot.items.push({ ...schedule, day: 'today' });
    });

    // Categorize tomorrow's medicines
    tomorrowSchedules.forEach(schedule => {
      const slot = timeSlots[schedule.time_slot as keyof typeof timeSlots];
      if (slot) slot.items.push({ ...schedule, day: 'tomorrow' });
    });

    // Generate HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #667eea; }
            .medicine-item { background: #f8f9fa; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea; }
            .medicine-name { font-weight: 600; color: #333; font-size: 16px; }
            .medicine-details { color: #666; font-size: 14px; margin-top: 5px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; margin-right: 8px; }
            .badge-today { background: #fef3c7; color: #92400e; }
            .badge-tomorrow { background: #dbeafe; color: #1e40af; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .empty-state { text-align: center; color: #999; padding: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💊 Your Medicine Schedule</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${profile.full_name || 'there'}! 👋</div>
              
              ${todayRemaining.length > 0 ? `
                <div class="section">
                  <div class="section-title">⏰ Remaining Today</div>
                  ${Object.entries(timeSlots).map(([key, slot]) => {
                    const todayItems = slot.items.filter(item => item.day === 'today');
                    if (todayItems.length === 0) return '';
                    return `
                      <div style="margin-bottom: 15px;">
                        <div style="font-weight: 500; color: #666; margin-bottom: 8px; font-size: 14px;">${slot.label}</div>
                        ${todayItems.map(item => `
                          <div class="medicine-item">
                            <div class="medicine-name">
                              <span class="badge badge-today">Today</span>
                              ${item.medicine_name}
                            </div>
                            <div class="medicine-details">
                              ${item.dosage} • ${item.instruction.replace('_', ' ')}
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `<div class="empty-state">✅ All done for today!</div>`}

              <div class="section">
                <div class="section-title">📅 Tomorrow's Schedule</div>
                ${Object.entries(timeSlots).map(([key, slot]) => {
                  const tomorrowItems = slot.items.filter(item => item.day === 'tomorrow');
                  if (tomorrowItems.length === 0) return '';
                  return `
                    <div style="margin-bottom: 15px;">
                      <div style="font-weight: 500; color: #666; margin-bottom: 8px; font-size: 14px;">${slot.label}</div>
                      ${tomorrowItems.map(item => `
                        <div class="medicine-item">
                          <div class="medicine-name">
                            <span class="badge badge-tomorrow">Tomorrow</span>
                            ${item.medicine_name}
                          </div>
                          <div class="medicine-details">
                            ${item.dosage} • ${item.instruction.replace('_', ' ')}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  `;
                }).join('')}
              </div>

              <div style="text-align: center;">
                <a href="${Deno.env.get('VITE_SUPABASE_URL') || 'http://localhost:8080'}" class="cta-button">
                  Open App →
                </a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">Stay healthy! Take your medicines on time.</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">You're receiving this because email notifications are enabled in your settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    // Note: In Resend test mode, we can only send to the verified email address
    const { error: emailError } = await resend.emails.send({
      from: 'Medicine Reminder <onboarding@resend.dev>',
      to: ['kezv166@gmail.com'], // Using verified email for test mode
      subject: `💊 Your Medicine Schedule - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: emailError,
          note: 'To send to other emails, verify a domain at resend.com/domains'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_email_sent_date
    await supabase
      .from("patient_profiles")
      .update({ last_email_sent_date: todayStr })
      .eq("user_id", userId);

    console.log('Email sent successfully to: kezv166@gmail.com (test mode)');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipient: 'kezv166@gmail.com',
        note: 'Test mode: Email sent to verified address. To use custom domains, verify at resend.com/domains'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-medicine-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);

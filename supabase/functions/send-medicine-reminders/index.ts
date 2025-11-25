import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for upcoming medicine reminders...');

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    console.log(`Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    
    // Define time slots and their corresponding hours
    const timeSlots: Record<string, number> = {
      'morning': 8,
      'afternoon': 14,
      'evening': 18,
      'night': 21
    };

    // Get all medicine schedules with scheduled_time
    const { data: schedules, error: schedulesError } = await supabase
      .from('medicine_schedules')
      .select(`
        id,
        medicine_name,
        dosage,
        time_slot,
        scheduled_time,
        instruction,
        patient_id,
        patient_profiles (
          user_id,
          full_name,
          push_notifications_enabled
        )
      `);

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      throw schedulesError;
    }

    console.log(`Found ${schedules?.length || 0} total schedules`);

    // Filter schedules that need notifications NOW (within ±2 minute buffer of scheduled time)
    const upcomingSchedules = schedules?.filter((schedule: any) => {
      if (!schedule.patient_profiles?.push_notifications_enabled) return false;
      
      // Use scheduled_time if available, otherwise fall back to time_slot
      if (schedule.scheduled_time) {
        const [schedHour, schedMin] = schedule.scheduled_time.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMinute;
        const scheduledMinutes = schedHour * 60 + schedMin;
        const timeDiff = Math.abs(currentMinutes - scheduledMinutes);
        
        // Send notification if within ±2 minutes
        if (timeDiff <= 2) {
          console.log(`✓ Scheduling reminder for ${schedule.medicine_name} at ${schedule.scheduled_time}`);
          return true;
        }
      } else {
        // Fallback to old time_slot logic
        const scheduleHour = timeSlots[schedule.time_slot];
        if (scheduleHour === undefined) return false;

        const isCorrectHour = currentHour === scheduleHour;
        const isWithinBuffer = currentMinute < 5;
        
        if (isCorrectHour && isWithinBuffer) {
          console.log(`✓ Scheduling reminder for ${schedule.medicine_name} (${schedule.time_slot} at ${scheduleHour}:00)`);
          return true;
        }
      }
      
      return false;
    });

    console.log(`Found ${upcomingSchedules?.length || 0} schedules needing notifications`);

    if (!upcomingSchedules || upcomingSchedules.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No reminders to send at this time',
          schedulesChecked: schedules?.length || 0,
          notificationsSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(upcomingSchedules?.map((s: any) => s.patient_profiles?.user_id))];
    
    // Get push subscriptions for these users
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${subscriptions?.length || 0} push subscriptions`);

    // Send notifications using web-push library (dynamic import to avoid TS issues)
    let sentCount = 0;
    let failedCount = 0;
    
    // Dynamic import using eval to bypass TypeScript checking
    const webPushModule = await eval('import("npm:web-push@3.6.6")');
    const webpush = webPushModule.default;
    
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:support@medconnect.com',
      vapidPublicKey,
      vapidPrivateKey
    );
    
    for (const schedule of upcomingSchedules || []) {
      const scheduleAny = schedule as any;
      const userSubs = subscriptions?.filter(
        (sub: any) => sub.user_id === scheduleAny.patient_profiles?.user_id
      );

      for (const sub of userSubs || []) {
        try {
          const timeSlotLabel = scheduleAny.time_slot.charAt(0).toUpperCase() + scheduleAny.time_slot.slice(1);
          
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            JSON.stringify({
              title: '💊 Time to Take Your Medicine!',
              body: `Take ${scheduleAny.medicine_name} (${scheduleAny.dosage}) - ${scheduleAny.instruction.replace('_', ' ')}`,
              tag: scheduleAny.id,
              url: '/patient-dashboard'
            })
          );
          
          sentCount++;
          console.log(`Sent notification for ${scheduleAny.medicine_name} to user ${scheduleAny.patient_profiles?.user_id}`);
        } catch (error: any) {
          failedCount++;
          console.error(`Failed to send notification to ${sub.endpoint}:`, error);
          
          // If subscription is no longer valid, remove it
          if (error.statusCode === 410) {
            console.log(`Removing invalid subscription: ${sub.endpoint}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
        }
      }
    }

    console.log(`Successfully sent ${sentCount} notifications (${failedCount} failed)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        schedulesChecked: schedules?.length || 0,
        notificationsSent: sentCount,
        notificationsFailed: failedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-medicine-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

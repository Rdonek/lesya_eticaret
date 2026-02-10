-- STEP 1: Enable HTTP extension to allow Supabase to send requests to Expo
create extension if not exists "http" with schema "extensions";

-- STEP 2: Create the function that sends the notification
CREATE OR REPLACE FUNCTION public.send_push_notification_via_expo()
RETURNS TRIGGER AS $$
DECLARE
    push_tokens TEXT[];
BEGIN
    -- 1. Collect target admin tokens
    IF NEW.user_id IS NOT NULL THEN
        -- Specific user notification
        SELECT ARRAY[push_token] INTO push_tokens 
        FROM public.profiles 
        WHERE id = NEW.user_id AND push_token IS NOT NULL;
    ELSE
        -- Global (Broadcast) notification to all admins with a token
        SELECT array_agg(push_token) INTO push_tokens 
        FROM public.profiles 
        WHERE push_token IS NOT NULL;
    END IF;

    -- 2. Exit if no tokens found
    IF push_tokens IS NULL OR array_length(push_tokens, 1) = 0 THEN
        RETURN NEW;
    END IF;

    -- 3. Loop through tokens and send to Expo
    FOR i IN 1 .. array_length(push_tokens, 1) LOOP
        IF push_tokens[i] IS NOT NULL THEN
            PERFORM extensions.http_post(
                'https://exp.host/--/api/v2/push/send',
                jsonb_build_object(
                    'to', push_tokens[i],
                    'title', NEW.title,
                    'body', NEW.body,
                    'sound', 'default',
                    'data', jsonb_build_object(
                        'notificationId', NEW.id,
                        'type', NEW.type,
                        'related_id', NEW.related_id
                    ) || COALESCE(NEW.data, '{}'::jsonb)
                )::text,
                'application/json'
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create the trigger to fire on every new notification
DROP TRIGGER IF EXISTS on_notification_created_send_push ON public.notifications;
CREATE TRIGGER on_notification_created_send_push
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_notification_via_expo();

-- 1. Create a table to catch Expo's response (DEBUGGING)
CREATE TABLE IF NOT EXISTS public.push_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID,
    token TEXT,
    response_status INTEGER,
    response_body TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enhanced Function with Logging and Android Channel Support
CREATE OR REPLACE FUNCTION public.send_push_notification_via_expo()
RETURNS TRIGGER AS $$
DECLARE
    push_tokens TEXT[];
    image_url TEXT;
    expo_response record;
    payload JSONB;
BEGIN
    -- 1. Extract image URL
    image_url := NEW.data->>'image_url';

    -- 2. Collect target admin tokens
    IF NEW.user_id IS NOT NULL THEN
        SELECT ARRAY[push_token] INTO push_tokens 
        FROM public.profiles 
        WHERE id = NEW.user_id AND push_token IS NOT NULL;
    ELSE
        SELECT array_agg(push_token) INTO push_tokens 
        FROM public.profiles 
        WHERE push_token IS NOT NULL;
    END IF;

    -- 3. Exit if no tokens found
    IF push_tokens IS NULL OR array_length(push_tokens, 1) = 0 THEN
        RETURN NEW;
    END IF;

    -- 4. Loop through tokens and send
    FOR i IN 1 .. array_length(push_tokens, 1) LOOP
        IF push_tokens[i] IS NOT NULL THEN
            
            -- Prepare the payload
            payload := jsonb_build_object(
                'to', push_tokens[i],
                'title', NEW.title,
                'body', NEW.body,
                'sound', 'default',
                'channelId', 'default', -- CRITICAL FOR ANDROID APK
                'priority', 'high',
                'mutableContent', true,
                'data', jsonb_build_object(
                    'notificationId', NEW.id,
                    'type', NEW.type,
                    'related_id', NEW.related_id
                ) || COALESCE(NEW.data, '{}'::jsonb)
            );

            -- Send and Catch Result
            SELECT status, content INTO expo_response FROM extensions.http_post(
                'https://exp.host/--/api/v2/push/send',
                payload::text,
                'application/json'
            );

            -- Log the result for debugging
            INSERT INTO public.push_logs (notification_id, token, response_status, response_body)
            VALUES (NEW.id, push_tokens[i], expo_response.status, expo_response.content);

        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

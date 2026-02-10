-- UPDATE: Enhanced Push Notification Function with Image Support
CREATE OR REPLACE FUNCTION public.send_push_notification_via_expo()
RETURNS TRIGGER AS $$
DECLARE
    push_tokens TEXT[];
    image_url TEXT;
BEGIN
    -- 1. Extract image URL from the 'data' JSONB column if it exists
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

    -- 4. Loop through tokens and send RICH notification to Expo
    FOR i IN 1 .. array_length(push_tokens, 1) LOOP
        IF push_tokens[i] IS NOT NULL THEN
            PERFORM extensions.http_post(
                'https://exp.host/--/api/v2/push/send',
                jsonb_build_object(
                    'to', push_tokens[i],
                    'title', NEW.title,
                    'body', NEW.body,
                    'sound', 'default',
                    'priority', 'high',
                    'mutableContent', true, -- Required for iOS images
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

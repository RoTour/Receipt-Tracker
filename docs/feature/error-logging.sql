-- docs/feature/error-logging.sql

CREATE TABLE rtdev.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    level TEXT NOT NULL, -- e.g., 'ERROR', 'WARN', 'INFO'
    message TEXT NOT NULL,
    stack_trace TEXT,
    metadata JSONB -- For storing contextual data like request ID, user ID, etc.
);

COMMENT ON TABLE rtdev.logs IS 'Stores application-level logs and errors.';

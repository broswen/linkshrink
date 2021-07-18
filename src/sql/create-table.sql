CREATE TABLE IF NOT EXISTS public.clickevents
(
    id bigint NOT NULL,
    slug text NOT NULL,
    key text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    ip text NOT NULL,
    lang text,
    useragent text,
    PRIMARY KEY (id)
);

ALTER TABLE public.clickevents
    OWNER to postgres;
CREATE TABLE IF NOT EXISTS public.clickevents
(
    id serial NOT NULL,
    slug text NOT NULL,
    key text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    ip text NOT NULL,
    lang text NOT NULL,
    useragent text NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE public.clickevents
    OWNER to postgres;
alter table public.companies
  add column door_opener_id uuid references public.profiles (id) on delete set null;

create index if not exists companies_door_opener_id_idx on public.companies (door_opener_id);

update public.profiles
set role = 'admin'
where id in (
  '165d923b-c8ff-4207-a735-56fffa717654', -- Majed Zamzami
  '623c27cd-8a00-45a1-882a-85b0ad75e5ea', -- Abdullah Bin Helo
  'd8abffd9-78fd-4ef1-a98d-eea6d86c6a37'  -- Abdullah Al Hamoud
);

update public.profiles
set full_name = 'Ahmed'
where id = 'b576fd18-b180-4a40-976b-ff1fa43082c3' and full_name is null;

-- Fix group_members_select: use SECURITY DEFINER helper so we never query group_members
-- from within its own RLS (avoids recursion; restores creator/member visibility and profile updates).

create or replace function public.user_is_member_of_group(gid uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = uid);
$$;

drop policy if exists "group_members_select" on public.group_members;

create policy "group_members_select" on public.group_members
  for select using (
    auth.uid() = user_id
    or public.is_group_creator(group_id, auth.uid())
    or public.user_is_member_of_group(group_id, auth.uid())
  );

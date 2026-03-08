-- Allow group members to see all members of the same group (including the owner).
-- (Superseded by 20260308100001 which uses a SECURITY DEFINER helper to avoid RLS recursion.)

drop policy if exists "group_members_select" on public.group_members;

create policy "group_members_select" on public.group_members
  for select using (
    auth.uid() = user_id
    or public.is_group_creator(group_id, auth.uid())
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

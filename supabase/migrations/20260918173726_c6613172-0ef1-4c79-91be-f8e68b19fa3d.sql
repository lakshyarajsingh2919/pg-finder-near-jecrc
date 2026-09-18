revoke execute on function public.update_updated_at_column() from anon, authenticated;
revoke execute on function public.refresh_pg_rating() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon;
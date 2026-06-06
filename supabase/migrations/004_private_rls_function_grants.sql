revoke all on function app_private.current_company_id() from public, anon;
revoke all on function app_private.current_role() from public, anon;
revoke all on function app_private.is_admin_or_manager() from public, anon;
revoke all on function app_private.can_access_work_order(uuid) from public, anon;

grant execute on function app_private.current_company_id() to authenticated;
grant execute on function app_private.current_role() to authenticated;
grant execute on function app_private.is_admin_or_manager() to authenticated;
grant execute on function app_private.can_access_work_order(uuid) to authenticated;

delete from public.invoice_drafts duplicate
using public.invoice_drafts keeper
where duplicate.work_order_id = keeper.work_order_id
  and (
    duplicate.updated_at < keeper.updated_at
    or (
      duplicate.updated_at = keeper.updated_at
      and duplicate.id < keeper.id
    )
  );

create unique index if not exists invoice_drafts_work_order_id_unique_idx
on public.invoice_drafts(work_order_id);

-- illustration_display
ALTER TABLE presentation_page ADD COLUMN illustration_display text DEFAULT 'cover';
COMMENT ON COLUMN presentation_page.illustration_display IS 'Illustration image position and size: contain, cover or stretched';
-- title_align
ALTER TABLE presentation_page ADD COLUMN title_align text DEFAULT 'left';
COMMENT ON COLUMN presentation_page.title_align IS 'Alignment of the page title';
-- title_visible
ALTER TABLE presentation_page ADD COLUMN title_visible text DEFAULT TRUE;
COMMENT ON COLUMN presentation_page.title_visible IS 'Illustration image position and size: contain, cover or stretched';

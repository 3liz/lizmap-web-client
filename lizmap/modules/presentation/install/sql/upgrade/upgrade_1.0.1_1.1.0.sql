-- presentation
ALTER TABLE presentation ADD COLUMN IF NOT EXISTS text_color       text DEFAULT '#FFFFFF';
COMMENT ON COLUMN presentation.background_display IS 'Default background image position and size: contain, cover or stretched';
COMMENT ON COLUMN presentation.background_color IS 'Default background color of all presentation pages';
COMMENT ON COLUMN presentation.text_color IS 'Default text color of all presentation pages';

-- presentation_table
ALTER TABLE presentation_page ADD COLUMN IF NOT EXISTS background_display text DEFAULT 'cover';
ALTER TABLE presentation_page ADD COLUMN IF NOT EXISTS text_color       text DEFAULT '#FFFFFF';
COMMENT ON COLUMN presentation_page.background_display IS 'Background image position and size: contain, cover or stretched';
COMMENT ON COLUMN presentation_page.text_color IS 'Text color on the page';

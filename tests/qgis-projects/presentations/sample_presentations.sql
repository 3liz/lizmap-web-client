--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8 (Debian 15.8-1.pgdg110+1)
-- Dumped by pg_dump version 15.8 (Debian 15.8-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: presentation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO lizmap.presentation (id, uuid, repository, project, title, description, background_image, background_display, background_color, text_color, footer, published, granted_groups, created_by, created_at, updated_by, updated_at) VALUES (1, 'f7af1511-b21e-44c6-b7f4-100857a13e1a', 'tests', 'presentation', 'Presentation', '
    <p>test</p>
  ', NULL, 'cover', NULL, NULL, NULL, false, 'group_a', 'admin', '2024-06-10 10:36:48.169718', 'admin', '2024-06-10 10:36:48.169718');


--
-- Data for Name: presentation_page; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO lizmap.presentation_page (id, uuid, presentation_id, title, title_align, title_visible, description, page_order, model, background_image, background_display, background_color, text_color, map_extent, tree_state, illustration_type, illustration_media, illustration_url, illustration_display, illustration_feature) VALUES (4, '7db6b1b7-32af-4dac-a981-3e4679432afc', 1, 'End of the presentation', 'left', true, '
    <p>In this last page:</p>
    <ul>
      <li>we zoom back to the <strong>full extent</strong> </li>
      <li>with<strong> all layers visible,</strong></li>
      <li><strong>the aerial photo layer</strong> activated,</li>
      <li>and we display a nice <strong>video with bird singing in a peaceful forest</strong> below (click to play)</li>
    </ul>
    <p>Enjoy 🐦 🌳</p>
  ', 4, 'text-above-media', 'media/upload/presentations/presentation/f7af1511-b21e-44c6-b7f4-100857a13e1a/page_background_image_7db6b1b7-32af-4dac-a981-3e4679432afc.jpg', 'cover', '#000000', '#000000', '769826.1779337098,6279538.023875835,771036.6491046521,6280188.900177588', '{"groups":[],"layers":["water_surfaces","trees","footways","gardens"],"baseLayer":"Orthophoto IGN"}', 'video', NULL, 'https://www.youtube.com/watch?v=mqyj3CJhes0', 'cover', NULL);
INSERT INTO lizmap.presentation_page (id, uuid, presentation_id, title, title_align, title_visible, description, page_order, model, background_image, background_display, background_color, text_color, map_extent, tree_state, illustration_type, illustration_media, illustration_url, illustration_display, illustration_feature) VALUES (1, 'c9f36c14-cdb3-4d61-b173-d722fc41c03b', 1, 'Introduction', 'left', true, '
    <p>This page is the first page of our demo presentation.</p>
    <p>It will:</p>
    <ul>
      <li><strong>center</strong> the map on the data</li>
      <li><strong>display all the layers</strong> </li>
      <li>above the default <i><strong>OpenStreetMap</strong></i> background.</li>
    </ul>
    <p>You can play with the following <strong>key shortcuts</strong> to navigate between pages</p>
    <ul>
      <li>LEFT or UP: go to the <strong>previous</strong> page</li>
      <li>RIGHT or DOWN: go to the <strong>next</strong> page</li>
      <li>CTRL+LEFT or CTRL+UP: go to the <strong>first</strong> page</li>
      <li>CTRL+RIGHT or CTRL+DOWN: go to the <strong>last</strong> page</li>
      <li>ESC: <strong>minimize</strong> the presentation</li>
      <li>CTRL+ESC: <strong>close</strong> the presentation</li>
    </ul>
  ', 1, 'text', 'media/upload/presentations/presentation/f7af1511-b21e-44c6-b7f4-100857a13e1a/page_background_image_c9f36c14-cdb3-4d61-b173-d722fc41c03b.jpg', 'cover', '#000000', '#000000', '769996.1258331311,6279501.286097283,770803.7680734156,6280152.162399035', '{"groups":[],"layers":["water_surfaces","trees","footways","gardens"],"baseLayer":"OpenStreetMap"}', NULL, NULL, NULL, 'cover', NULL);
INSERT INTO lizmap.presentation_page (id, uuid, presentation_id, title, title_align, title_visible, description, page_order, model, background_image, background_display, background_color, text_color, map_extent, tree_state, illustration_type, illustration_media, illustration_url, illustration_display, illustration_feature) VALUES (3, '583be265-9f5f-4b9f-a65d-7a0dea38dc85', 1, 'Back to full extent with some trees', 'center', true, '
    <p>In this page, </p>
    <ul>
      <li>we go back to the <strong>full extent</strong>, </li>
      <li>but display <strong>only the trees</strong></li>
      <li>over the <i><strong>OpenTopoMap</strong></i> background</li>
      <li>we show <strong>Lizmap logo</strong> under this text</li>
      <li>and use a nice picture as the <strong>page background image</strong></li>
    </ul>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ullamcorper lacus quis nunc lobortis, nec elementum ex cursus. Aenean pretium dui libero, sit amet aliquet diam dictum at. Donec enim lectus, lobortis faucibus dignissim et, fermentum a metus. Ut sit amet vestibulum odio. Sed suscipit turpis ex, ac interdum diam imperdiet vitae. Mauris dignissim lorem tellus, pellentesque vestibulum dolor tincidunt sed. Nunc mollis varius mauris, nec scelerisque sapien tempor non. Suspendisse eget ante iaculis, eleifend purus sed, rhoncus nunc.</p>
  ', 3, 'text-above-media', 'media/upload/presentations/presentation/f7af1511-b21e-44c6-b7f4-100857a13e1a/page_background_image_583be265-9f5f-4b9f-a65d-7a0dea38dc85.jpg', 'cover', '#000000', '#000000', '769989.5112365688,6279503.931935907,770797.1534768533,6280154.80823766', '{"groups":[],"layers":["trees"],"baseLayer":"OpenTopoMap"}', 'image', 'media/upload/presentations/presentation/f7af1511-b21e-44c6-b7f4-100857a13e1a/page_illustration_media_583be265-9f5f-4b9f-a65d-7a0dea38dc85.png', NULL, 'contain', NULL);
INSERT INTO lizmap.presentation_page (id, uuid, presentation_id, title, title_align, title_visible, description, page_order, model, background_image, background_display, background_color, text_color, map_extent, tree_state, illustration_type, illustration_media, illustration_url, illustration_display, illustration_feature) VALUES (2, 'f5fdb375-77b3-4ca4-a3f4-f5fef9c0ca7e', 1, 'See the lake', 'left', false, '
    <p>This page will </p>
    <ul>
      <li>zoom to the <strong>lake</strong> </li>
      <li>display only the layer “<strong>water surfaces</strong>” and the <strong>green garden polygon</strong>.</li>
      <li>show the <strong>aerial photograph</strong> layer in background</li>
      <li>no background image for this page, only a <strong>light blue</strong> color</li>
    </ul>
    <p>Quisque semper orci eget diam ornare pharetra. Donec tincidunt ante velit, nec ultricies neque consequat non. Phasellus faucibus felis sit amet ex porta faucibus. Nam efficitur viverra ex, et gravida erat lobortis at. Etiam metus est, gravida et hendrerit congue, posuere non tortor. Donec efficitur lobortis eros interdum consequat. Fusce imperdiet diam eu eros rhoncus consequat. Aenean suscipit gravida pretium. Aliquam eu finibus dolor. Nulla consequat vulputate leo lacinia convallis. Nam hendrerit, nisi ut pharetra viverra, lacus mi bibendum metus, quis venenatis arcu turpis eget dolor. Aenean interdum bibendum elementum. Integer quis lorem a purus mollis varius. Quisque in metus vel odio fringilla placerat eu sed urna.</p>
  ', 2, 'media-above-text', NULL, NULL, '#76c4ff', '#1a5fb4', '770165.9508453966,6279733.842701719,770489.0077415104,6279994.193222419', '{"groups":[],"layers":["water_surfaces","gardens"],"baseLayer":"Orthophoto IGN"}', 'image', 'media/upload/presentations/presentation/f7af1511-b21e-44c6-b7f4-100857a13e1a/page_illustration_media_f5fdb375-77b3-4ca4-a3f4-f5fef9c0ca7e.jpg', NULL, 'cover', NULL);


--
-- Name: presentation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('lizmap.presentation_id_seq', 1, true);


--
-- Name: presentation_page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('lizmap.presentation_page_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

// @ts-check
import { test, expect } from '@playwright/test';
import { ProjectPage } from "./pages/project";
//import { expectParametersToContain } from './globals';

test.describe('Dataviz tests @readonly', () => {

    test('Test dataviz plots are rendered', async ({ page }) => {
        const project = new ProjectPage(page, 'dataviz');
        await project.open();

        // Check the plots are organized as configured in plugin (HTML Drag & drop layout)
        // Check dataviz content
        let datavizContent = page.locator('#dataviz-container > #dataviz-content');
        // Check the plots are organized as configured in plugin (HTML Drag & drop layout)
        // expect(datavizContent.locator('> div.tab-content').getByRole('tablist').getByRole('presentation')).toHaveCount(2);
        // 2 tabs level 0
        await expect(datavizContent.locator('> div.tab-content > ul > li')).toHaveCount(2);
        await expect(datavizContent.locator('> div.tab-content > ul > li:nth-child(1) > button')).toHaveText('First tab');
        await expect(datavizContent.locator('> div.tab-content > ul > li:nth-child(2) > button')).toHaveText('Second tab');
        // 2 tab panes level 0
        await expect(datavizContent.locator('> div.tab-content > .tab-pane')).toHaveCount(2);
        await expect(datavizContent.locator('> div.tab-content .level-0')).toHaveCount(2);

        // Check the first tab, it is active
        let firstTab = datavizContent.locator('> div.tab-content > ul > li:nth-child(1) > button');
        await expect(firstTab).toContainClass('active');
        await expect(firstTab).toHaveAttribute('data-bs-target', /dataviz-dnd-0-[0-9a-z]{32}/);
        // Check the first tab pane
        let firstTabPane = datavizContent.locator('> div.tab-content > .tab-pane').nth(0);
        await expect(firstTabPane).toContainClass('active');
        await expect(firstTabPane).toContainClass('dataviz-dnd-tab');
        await expect(firstTabPane).toContainClass('level-0');
        await expect(firstTabPane).toHaveAttribute('id', /dataviz-dnd-0-[0-9a-z]{32}/);
        await expect(firstTabPane.locator('> fieldset')).toHaveCount(2);
        await expect(firstTabPane.locator('> fieldset').nth(0)).toContainClass('level-1');
        await expect(firstTabPane.locator('> fieldset').nth(1)).toContainClass('level-1');
        await expect(firstTabPane.locator('.level-1')).toHaveCount(2);
        await expect(firstTabPane.locator('fieldset.level-1 > legend')).toHaveCount(2);
        await expect(firstTabPane.locator('fieldset.level-1 > legend').nth(0)).toHaveText('Group A');
        await expect(firstTabPane.locator('fieldset.level-1 > legend').nth(1)).toHaveText('Group B');
        // Check second fieldset in the first tab pane
        let secondFieldSetFirstTabPane = firstTabPane.locator('fieldset.level-1:nth-child(2)');
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content')).toHaveCount(1);
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > .tab-pane')).toHaveCount(2);
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > .tab-pane').nth(0)).toContainClass('level-2');
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > .tab-pane').nth(1)).toContainClass('level-2');
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > ul > li')).toHaveCount(2);
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > ul > li:nth-child(1) > button')).toHaveText('Sub-Tab X');
        await expect(secondFieldSetFirstTabPane.locator('div.tab-content > ul > li:nth-child(2) > button')).toHaveText('Sub-tab Y');

        // Check the second tab, it is not active
        let secondTab = datavizContent.locator('> div.tab-content > ul > li:nth-child(2) > button');
        await expect(secondTab).not.toContainClass('active');
        await expect(secondTab).toHaveAttribute('data-bs-target', /dataviz-dnd-0-[0-9a-z]{32}/);
        // Check the first tab pane
        let secondTabPane = datavizContent.locator('> div.tab-content > .tab-pane').nth(1);
        await expect(secondTabPane).not.toContainClass('active');
        await expect(secondTabPane).toContainClass('dataviz-dnd-tab');
        await expect(secondTabPane).toContainClass('level-0');
        await expect(secondTabPane).toHaveAttribute('id', /dataviz-dnd-0-[0-9a-z]{32}/);
        await expect(secondTabPane.locator('> fieldset')).toHaveCount(1);
        await expect(secondTabPane.locator('> fieldset')).toContainClass('level-1');
        await expect(secondTabPane.locator('.level-1')).toHaveCount(1);
        await expect(secondTabPane.locator('fieldset.level-1 > legend')).toHaveCount(1);
        await expect(secondTabPane.locator('fieldset.level-1 > legend')).toHaveText('Other group');

        // Check plots containers
        await expect(firstTabPane.locator('div.dataviz-dnd-plot')).toHaveCount(3);
        await expect(firstTabPane.locator('div.dataviz-dnd-plot div.dataviz_plot_container')).toHaveCount(3);
        await expect(firstTabPane.locator('div.dataviz_plot_container')).toHaveCount(3);
        await expect(secondFieldSetFirstTabPane.locator('div.dataviz-dnd-plot')).toHaveCount(2);
        await expect(secondFieldSetFirstTabPane.locator('div.dataviz-dnd-plot div.dataviz_plot_container')).toHaveCount(2);
        await expect(secondFieldSetFirstTabPane.locator('div.dataviz_plot_container')).toHaveCount(2);
        await expect(secondTabPane.locator('div.dataviz-dnd-plot')).toHaveCount(2);
        await expect(secondTabPane.locator('div.dataviz-dnd-plot div.dataviz_plot_container')).toHaveCount(2);
        await expect(secondTabPane.locator('div.dataviz_plot_container')).toHaveCount(2);

        await expect(page.locator('div.dataviz-dnd-plot')).toHaveCount(5); // 3 + 2 + 2
        await expect(page.locator('div.dataviz-dnd-plot div.dataviz_plot_container')).toHaveCount(5); // 3 + 2 + 2
        await expect(page.locator('div.dataviz_plot_container')).toHaveCount(5); // 3 + 2 + 2

        // Check Plot 0
        let plot0container = page.locator('#dataviz_plot_0_container');
        await expect(plot0container).toContainClass('dataviz_plot_container');
        await expect(plot0container.locator('h3')).toHaveCount(1);
        await expect(plot0container.locator('h3 .title')).toHaveCount(1);
        await expect(plot0container.locator('h3 .title .text')).toHaveCount(1);
        await expect(plot0container.locator('h3 .title .text')).toHaveText('Municipalities');
        await expect(plot0container.locator('#dataviz_plot_0')).toHaveCount(1);
        await expect(plot0container.locator('.dataviz-waiter')).toHaveCount(1);
        // Plot 0 waiter is displayed
        await expect(plot0container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 0 has not been rendered by Plotly
        await expect(plot0container.locator('#dataviz_plot_0')).not.toContainClass('js-plotly-plot');

        // Check Plot 1
        let plot1container = page.locator('#dataviz_plot_1_container');
        await expect(plot1container).toContainClass('dataviz_plot_container');
        await expect(plot1container.locator('h3')).toHaveCount(1);
        await expect(plot1container.locator('h3 .title')).toHaveCount(1);
        await expect(plot1container.locator('h3 .title .text')).toHaveCount(1);
        await expect(plot1container.locator('h3 .title .text')).toHaveText('Bar Bakeries by municipalities');
        await expect(plot1container.locator('#dataviz_plot_1')).toHaveCount(1);
        await expect(plot1container.locator('.dataviz-waiter')).toHaveCount(1);
        // Plot 1 waiter is displayed
        await expect(plot1container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 1 has not been rendered by Plotly
        await expect(plot1container.locator('#dataviz_plot_1')).not.toContainClass('js-plotly-plot');

        // Check plot 2
        let plot2container = page.locator('#dataviz_plot_2_container');
        await expect(plot2container).toContainClass('dataviz_plot_container');
        await expect(plot2container.locator('h3')).toHaveCount(1);
        await expect(plot2container.locator('h3 .title')).toHaveCount(1);
        await expect(plot2container.locator('h3 .title .text')).toHaveCount(1);
        await expect(plot2container.locator('h3 .title .text')).toHaveText('Pie Bakeries by municipalities');
        await expect(plot2container.locator('#dataviz_plot_2')).toHaveCount(1);
        await expect(plot2container.locator('.dataviz-waiter')).toHaveCount(1);
        // Plot 2 waiter is displayed
        await expect(plot2container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 2 has not been rendered by Plotly
        await expect(plot2container.locator('#dataviz_plot_2')).not.toContainClass('js-plotly-plot');

        // Check plot 3
        let plot3container = page.locator('#dataviz_plot_3_container');
        await expect(plot3container).toContainClass('dataviz_plot_container');
        await expect(plot3container.locator('h3')).toHaveCount(1);
        await expect(plot3container.locator('h3 .title')).toHaveCount(1);
        await expect(plot3container.locator('h3 .title .text')).toHaveCount(1);
        await expect(plot3container.locator('h3 .title .text')).toHaveText('Horizontal bar bakeries in municipalities');
        await expect(plot3container.locator('#dataviz_plot_3')).toHaveCount(1);
        await expect(plot3container.locator('.dataviz-waiter')).toHaveCount(1);
        // Plot 3 waiter is displayed
        await expect(plot3container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 3 has not been rendered by Plotly
        await expect(plot3container.locator('#dataviz_plot_3')).not.toContainClass('js-plotly-plot');

        // Check plot 4
        let plot4container = page.locator('#dataviz_plot_4_container');
        await expect(plot4container).toContainClass('dataviz_plot_container');
        await expect(plot4container.locator('h3')).toHaveCount(1);
        await expect(plot4container.locator('h3 .title')).toHaveCount(1);
        await expect(plot4container.locator('h3 .title .text')).toHaveCount(1);
        await expect(plot4container.locator('h3 .title .text')).toHaveText('Never filtered plot');
        await expect(plot4container.locator('#dataviz_plot_4')).toHaveCount(1);
        await expect(plot4container.locator('.dataviz-waiter')).toHaveCount(1);
        // Plot 4 waiter is displayed
        await expect(plot4container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 4 has not been rendered by Plotly
        await expect(plot4container.locator('#dataviz_plot_4')).not.toContainClass('js-plotly-plot');

        // Check the GetPlot request
        let getPlotRequest1Promise = project.waitForGetPlotRequest('0');
        let getPlotRequest2Promise = project.waitForGetPlotRequest('1');
        page.locator('#button-dataviz').click();
        let requests = await Promise.all([getPlotRequest1Promise, getPlotRequest2Promise]);
        let getPlot1Request = requests[0]; // await getPlotRequest1Promise;
        let getPlot2Request = requests[1]; // await getPlotRequest2Promise;
        await expect(getPlot1Request.headers()).toHaveProperty('content-type', 'application/json');
        let postData = await getPlot1Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', '0');
        await expect(getPlot2Request.headers()).toHaveProperty('content-type', 'application/json');
        postData = await getPlot2Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', '1');
        await getPlot1Request.response();
        await getPlot2Request.response();

        // 2 tab panes, the first is visible, the second is hidden
        await expect(datavizContent.locator('> div.tab-content > .tab-pane')).toHaveCount(2);
        await expect(datavizContent.locator('> div.tab-content > .tab-pane').nth(0)).toBeVisible();
        await expect(datavizContent.locator('> div.tab-content > .tab-pane').nth(1)).toBeHidden();

        // Plot 0 has been rendered by Plotly
        await expect(plot0container.locator('#dataviz_plot_0')).toContainClass('js-plotly-plot');
        // Plot 0 waiter is disabled
        await expect(plot0container.locator('.dataviz-waiter')).toHaveCSS('display', 'none');
        // Plot 1 has been rendered by Plotly
        await expect(plot1container.locator('#dataviz_plot_1')).toContainClass('js-plotly-plot');
        // Plot 1 waiter is disabled
        await expect(plot1container.locator('.dataviz-waiter')).toHaveCSS('display', 'none');
        // Plot 2 waiter is still displayed
        await expect(plot2container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 2 has not yet been rendered by Plotly
        await expect(plot2container.locator('#dataviz_plot_2')).not.toContainClass('js-plotly-plot');
        // Plot 3 waiter is still displayed
        await expect(plot3container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 3 has not yet been rendered by Plotly
        await expect(plot3container.locator('#dataviz_plot_3')).not.toContainClass('js-plotly-plot');
        // Plot 4 waiter is still displayed
        await expect(plot4container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 4 has not yet been rendered by Plotly
        await expect(plot4container.locator('#dataviz_plot_4')).not.toContainClass('js-plotly-plot');

        // Display Sub-tab Y and get the third plot
        let getPlotRequest3Promise = project.waitForGetPlotRequest();
        await secondFieldSetFirstTabPane.locator('div.tab-content > ul > li:nth-child(2) > button').click();
        let getPlot3Request = await getPlotRequest3Promise;
        await expect(getPlot3Request.headers()).toHaveProperty('content-type', 'application/json');
        postData = await getPlot3Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', '2');
        await getPlot3Request.response();

        // Plot 2 has been rendered by Plotly
        await expect(plot2container.locator('#dataviz_plot_2')).toContainClass('js-plotly-plot');
        // Plot 2 waiter is disabled
        await expect(plot2container.locator('.dataviz-waiter')).toHaveCSS('display', 'none');
        // Plot 3 waiter is still displayed
        await expect(plot3container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 3 has not yet been rendered by Plotly
        await expect(plot3container.locator('#dataviz_plot_3')).not.toContainClass('js-plotly-plot');
        // Plot 4 waiter is still displayed
        await expect(plot4container.locator('.dataviz-waiter')).not.toHaveCSS('display', 'none');
        // Plot 4 has not yet been rendered by Plotly
        await expect(plot4container.locator('#dataviz_plot_4')).not.toContainClass('js-plotly-plot');

        // Display second tab to get last plots
        let getPlotRequest4Promise = project.waitForGetPlotRequest('3');
        let getPlotRequest5Promise = project.waitForGetPlotRequest('4');
        await datavizContent.locator('> div.tab-content > ul > li:nth-child(2) > button').click();
        requests = await Promise.all([getPlotRequest4Promise, getPlotRequest5Promise]);
        let getPlot4Request = requests[0]; // await getPlotRequest4Promise;
        let getPlot5Request = requests[1]; // await getPlotRequest5Promise;
        await expect(getPlot4Request.headers()).toHaveProperty('content-type', 'application/json');
        postData = await getPlot4Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', '3');
        await expect(getPlot5Request.headers()).toHaveProperty('content-type', 'application/json');
        postData = await getPlot5Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', '4');
        await getPlot4Request.response();
        await getPlot5Request.response();

        // Check the second tab, it is active
        await expect(secondTab).toContainClass('active');
        await expect(firstTab).not.toContainClass('active');
        // Check the first tab pane
        await expect(secondTabPane).toContainClass('active');
        await expect(firstTabPane).not.toContainClass('active');

        // Plot 3 has been rendered by Plotly
        await expect(plot3container.locator('#dataviz_plot_3')).toContainClass('js-plotly-plot');
        // Plot 3 waiter is disabled
        await expect(plot3container.locator('.dataviz-waiter')).toHaveCSS('display', 'none');
        // Plot 4 has been rendered by Plotly
        await expect(plot4container.locator('#dataviz_plot_4')).toContainClass('js-plotly-plot');
        // Plot 4 waiter is disabled
        await expect(plot4container.locator('.dataviz-waiter')).toHaveCSS('display', 'none');
    });

    test('Test filtered dataviz plots are rendered in a popup', async ({ page }) => {
        const project = new ProjectPage(page, 'dataviz_filtered_in_popup');
        await project.open();

        // Dataviz button does not exist because every dataviz has to be displayed in popup
        await expect(page.locator('#button-dataviz')).toHaveCount(0);

        // Catch the GetfeatureInfo
        let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();

        // Click on map
        await project.clickOnMap(550, 400);
        let getFeatureInfoRequest = await getFeatureInfoRequestPromise;

        // Check the GetPlot request
        let getPlotRequest1Promise = project.waitForGetPlotRequest('0');
        let getPlotRequest2Promise = project.waitForGetPlotRequest('1');

        // wait for GetfeatureInfo response
        let getFeatureInfoResponse = await getFeatureInfoRequest.response();
        expect(getFeatureInfoResponse).not.toBeNull();
        expect(getFeatureInfoResponse?.ok()).toBe(true);
        expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

        // wait for GetPlot requests
        let requests = await Promise.all([getPlotRequest1Promise, getPlotRequest2Promise]);
        let getPlot1Request = requests[0]; // await getPlotRequest1Promise;
        let getPlot2Request = requests[1]; // await getPlotRequest2Promise;
        await expect(getPlot1Request.headers()).toHaveProperty('content-type', 'application/json');
        let postData = await getPlot1Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 0);
        await expect(postData).toHaveProperty('exp_filter', '"polygon_id" IN (\'4\')');
        await expect(getPlot2Request.headers()).toHaveProperty('content-type', 'application/json');
        postData = await getPlot2Request.postDataJSON();
        await expect(postData).toHaveProperty('request', 'getPlot');
        await expect(postData).toHaveProperty('plot_id', 1);
        await expect(postData).toHaveProperty('exp_filter', '"polygon_id" IN (\'4\')');
        await getPlot1Request.response();
        await getPlot2Request.response();

        await expect(project.popupContent).toBeVisible();
        const popup = await project.identifyContentLocator('4');
        await expect(popup).toHaveAttribute('data-layer-id', /polygons_[0-9a-z_]{36}/);
        await expect(popup).toHaveAttribute('data-feature-id', '4');

        await expect(popup.locator('.lizdataviz')).toHaveCount(2);
        await expect(popup.locator('.lizdataviz h4').nth(0)).toHaveText('Number of bakeries for this polygon');
        await expect(popup.locator('.lizdataviz .dataviz_plot_container').nth(0)).toHaveId(/polygons_[0-9a-z_]{36}_4_1_[0-9a-zA-Z]{25}_container/);
        await expect(popup.locator('.lizdataviz .dataviz_plot_container .dataviz-waiter').nth(0)).toHaveCSS('display', 'none');
        await expect(popup.locator('.lizdataviz .dataviz_plot_container .plot-container').nth(0)).toContainClass('plotly');
        await expect(popup.locator('.lizdataviz .dataviz_plot_container .plot-container .svg-container').nth(0)).toHaveCSS('height', '400px');
        await expect(popup.locator('.lizdataviz h4').nth(1)).toHaveText('Bakeries');
        await expect(popup.locator('.lizdataviz .dataviz_plot_container').nth(1)).toHaveId(/polygons_[0-9a-z_]{36}_4_2_[0-9a-zA-Z]{25}_container/);
        await expect(popup.locator('.lizdataviz .dataviz_plot_container .dataviz-waiter').nth(1)).toHaveCSS('display', 'none');
        await expect(popup.locator('.lizdataviz .dataviz_plot_container').nth(1).locator(' div[id^="polygons_"]')).toHaveText('2');
    })
});

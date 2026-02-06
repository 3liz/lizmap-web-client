/* eslint-disable no-unused-vars */
const resultPanel = document.createElement('div');
resultPanel.style.position = 'absolute';
resultPanel.style.zIndex = '40000';
resultPanel.id = 'external-js-test';
resultPanel.style.top = "50px";
resultPanel.style.width ='50%';
resultPanel.style.left = '0';
resultPanel.style.right = '0';
resultPanel.style.marginLeft = 'auto';
resultPanel.style.marginRight = 'auto';
resultPanel.style.display = 'flex';
resultPanel.style.flexDirection = 'column';
resultPanel.style.background = 'white';
document.body.append(resultPanel);

const checkInterface = () => {
    lizMap.subscribe(()=>{
        function addRecordToResultPanel(result, error = false){
            const span = document.createElement('span');
            if(error) {
                span.setAttribute('error', true)
                span.style.color = 'red';
            }
            span.innerText = result;
            resultPanel.append(span);

        }
        const results = [];
        // check for layer tree
        results.push($("#node-single_wms_lines").length == 1 ? ['Layer tree is loaded'] : ['Layer tree NOT loaded', true]);
        // check for edition layer
        results.push($("#edition-layer option").length == 1 ? ['Edition layers is loaded'] : ['Edition layers is NOT loaded', true]);
        // check for filter
        results.push($("#liz-filter-field-textTitle_search").length == 1 ? ['Filter panel is loaded'] : ['Filter panel is NOT loaded', true]);
        // check for selection panel
        results.push($("#selectiontool .selectiontool-actions").length == 1 ? ['Selection panel is loaded'] : ['Selection panel is NOT loaded', true]);
        // check for draw panel
        results.push($("#draw .digitizing-import-export").length == 1 ? ['Draw panel is loaded'] : ['Draw panel is NOT loaded', true]);
        // check for LocateByLayer panel
        results.push($("#locate-layer-single_wms_lines").length == 1 ? ['Locate by layer panel is loaded'] : ['Locate by layer panel is NOT loaded', true]);
        // check for overview panel
        results.push($("#overview-box lizmap-mouse-position .mouse-position").length == 1 ? ['Overview box panel is loaded'] : ['Overview box panel is NOT loaded', true]);
        // check for measure panel
        results.push($("#measure").length == 1 ? ['Measure panel is loaded'] : ['Measure panel is NOT loaded', true]);
        // check for permaLink panel
        results.push($("#permaLink").length == 1 ? ['Permalink panel is loaded'] : ['Permalink panel is NOT loaded', true]);
        // check for attributeLayers panel
        results.push($("#attributeLayers").length == 1 ? ['Attribute layers panel is loaded'] : ['Attribute layers is NOT loaded', true]);

        // NOTE: print panel is not tested since the panel is loaded on minidockopened event

        results.forEach((r)=>{
            addRecordToResultPanel(r[0],r[1]);
        })
    }, 'lizmap.uicreated')
}

checkInterface();
// add some async code to check the subscribe function to work properly
setTimeout(()=>{
    checkInterface()
}, 3000)

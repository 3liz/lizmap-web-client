<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lizmap PDF Viewer</title>
    <style>
        #canvasContainer {
            width: 100%;
            height: 100%;
            overflow: auto;
        }
        canvas {
            display: block;
            margin: 0 auto;
        }
        #navigationControls {
            text-align: center;
            margin-top: 10px;
        }
    </style>
    {literal}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.4/purify.min.js"></script>
    {/literal}
    {$HEAD_CSS}
    {$HEAD_JS}
</head>
<body>
    <div id="canvasContainer">
        <canvas id="pdfCanvas"></canvas>
    </div>
    <div id="navigationControls">
        <button id="prev">Precedente</button>
        <button id="next">Successivo</button>
        <span>Pagina: <span id="page_num"></span> / <span id="page_count"></span></span>
    </div>
    {$FOOTER_JS}
</body>
</html>

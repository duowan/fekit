/**
 * Created by adi on 15-6-10.
 */

// module import
var fs = require('fs')
var Mustache = require('mustache')
var multiline = require('multiline')
var gui = require('nw.gui')
var notifier = require('node-notifier')
var UglifyJS = require('uglify-js')
var CleanCSS = require('clean-css');

// common data
var $fileType = $('[name="fileType"]')
var $dropbox = $('#dropbox')
var $preview = $('#dropbox')
var $out = $('#out')
var clipboard = gui.Clipboard.get()

// 1. main
dragAndBrowser($dropbox, handleFiles)
$dropbox.on('input', handleCopy)
$fileType.on('change', handleFileType)

function handleFileType(e){
    var fileType, sourceCode, targetCode
    sourceCode = $dropbox.val()
    fileType = $(this).val()

    targetCode = getMinifyCode(sourceCode, fileType)
    processResult(targetCode)
}

function handleCopy(e){
    var fileType, sourceCode, targetCode
    sourceCode = $dropbox.val()
    fileType = guessFileType(sourceCode)
    updateView($('[value="'+fileType+'"]'), {checked:true})

    targetCode = getMinifyCode(sourceCode, fileType)
    processResult(targetCode)

    function updateView(el, props){
        el.prop(props)
    }
}

function handleFiles(files) {
    var file = files[0], sourceCode, targetCode
    sourceCode = fs.readFileSync(file.path, "utf8")
    updateView($('[value="'+file.type+'"]'), {checked:true})
    previewFile($preview, sourceCode)

    targetCode = getMinifyCode(sourceCode, file.type)
    processResult(targetCode)

    function previewFile($el, code){
        $el.val(code)
    }
    function updateView(el, props){
        el.prop(props)
    }
}

// 2. partial

function processResult(targetCode){
    $out.val(targetCode)
    clipboard.set(targetCode, 'text')
    notifier.notify({'message':'代码已复制到剪切板！'})
}

function guessFileType(source){
    //var reg_html = /\<\w+\>(?!'|")/gm
    var reg_css = /\.\w[\w\d]*\{/gm
    //var reg_js = /function\s+\w[\w\d-_$]*\(/gm
    var fileType
    //if(reg_html.test(source)){
    //    return fileType = 'text/html'
    //}
    if(reg_css.test(source)){
        return fileType = 'text/css'
    }
    //if(reg_js.test(source)){
    return fileType = 'text/javascript'
    //}
}

function getMinifyCode(sourceCode, fileType){
    var targetCode
    switch (fileType){
        case 'text/javascript': targetCode = doMinifyJS(sourceCode); break;
        case 'text/css': targetCode = doMinifyCSS(sourceCode); break;
    }
    return targetCode
}

function doMinifyJS(source, isPath){
    var jsonCode = doMinifyJSON(source)
    if(jsonCode){
        return jsonCode
    }

    var options = {}
    if(!isPath){
        options.fromString = true
    }
    var result = UglifyJS.minify(source, options);
    return result.code
}

function doMinifyJSON(source){
    var code
    try{
        code = JSON.stringify(JSON.parse(source), null, 0)
    }catch(e) {

    }
    return code || false
}

function doMinifyCSS(source){
    var option = {
        compatibility: "ie7"
    }
    var result = new CleanCSS(option).minify(source)
    return result.styles
}

// 3. utils

function dragAndBrowser(el, handleFiles){
    var $el = $(el)
    var $file = $('<input type="file" style="display: none"/>')
    $file.insertAfter($el)

    $el.on('dblclick', function(e){
        $file.trigger('click')
        e.preventDefault()
    })
    $file.on('change', function (e) {
        handleFiles(this.files)
    })

    $el.on('dragenter', dragenter)
    $el.on('dragover', dragover)
    $el.on('drop', drop)

    function dragenter(e) {
        e.stopPropagation()
        e.preventDefault()
    }
    function dragover(e) {
        e.stopPropagation()
        e.preventDefault()
    }
    function drop(e) {
        e.stopPropagation()
        e.preventDefault()

        var files = e.originalEvent.dataTransfer.files
        handleFiles(files)
    }

}
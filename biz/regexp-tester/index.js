
// module import
var fs = require('fs')
var _ = require('lodash')
//var Mustache = require('mustache')
//var multiline = require('multiline')
//var gui = require('nw.gui')
//var notifier = require('node-notifier')

// enable editable
var gui = require('nw.gui');
if (process.platform === "darwin") {
    var mb = new gui.Menu({type: 'menubar'});
    mb.createMacBuiltin('RoboPaint', {
        hideEdit: false
    });
    gui.Window.get().menu = mb;
}


// regexp tester
var $source = $('[name="inputString"]')
var $regexp = $('[name="regexp"]')
var $form = $('form')
var $result = $('#out')

$source.on('input', exec)
$regexp.on('input', exec)

/**
 * 执行正则匹配，得到匹配数据
 */
function exec(e){
    try{
        var data = getFormData($form)
        var inputString = data.inputString
        var regexp = new RegExp(data.regexp, 'gm')
        var matchData = [], i = 0, match;
        if(!inputString || !data.regexp){
            $result.html('not match anything!')
            return;
        }

        // http://stackoverflow.com/questions/1761051/difference-between-n-and-r
        inputString = inputString.replace(/\r/gm,'')
        while (match=regexp.exec(inputString)) {
            matchData[i] = [regexp.lastIndex-match[0].length, regexp.lastIndex]
            i++
        }
        var outputString = format(inputString, matchData)
        $result.html(outputString)
    }catch(e){
        $result.html('not match anything!')
        return;
    }
}

/**
 * 通过匹配数据，得到格式化html
 */
function format(inputString, matchData) {
    if (matchData.length<1) {return 'not match anything!'}
    var indexMatchFirst = matchData[0][0]
    var indexMatchLast = matchData[matchData.length-1][1]
    var dest = transUnMatch( inputString.substring(0,indexMatchFirst) )
    matchData.forEach(function (item, index) {
        dest += transMatch( inputString.substring(item[0], item[1]) )
        if ( matchData[index+1] ) {
            dest += transUnMatch( inputString.substring(matchData[index][1], matchData[index+1][0]) )
        }
    })
    dest += transUnMatch( inputString.substring(indexMatchLast, inputString.length) )
    return dest.replace(/\r?\n|\r/g, '<br>')

    function transMatch(d) {
        return '<b>'+ _.escape(d) +'</b>'
    }
    function transUnMatch(d){
        return _.escape(d)
    }
}

/**
 * 表单数据toJSONObject
 */
function getFormData($form){
    var array = $form.serializeArray()
    var obj = {}
    $.map(array, function(item){
        if (!item['name']) {return};
        obj[item['name']] = item['value']
    })
    return obj
}
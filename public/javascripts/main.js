//@codekit-prepend "jquery-1.8.2.js";
//@codekit-prepend "bootstrap/bootstrap-dropdown.js";
//@codekit-prepend "underscore-1.3.3.js";
//@codekit-prepend "backbone-0.9.2.js";
//@codekit-prepend "shCore.js";
//@codekit-prepend "shBrushAS3.js";
//@codekit-prepend "shBrushBash.js";
//@codekit-prepend "shBrushCSharp.js";
//@codekit-prepend "shBrushCpp.js";
//@codekit-prepend "shBrushJScript.js";
//@codekit-prepend "shBrushJava.js";
//@codekit-prepend "shBrushPerl.js";
//@codekit-prepend "shBrushPhp.js";
//@codekit-prepend "shBrushPlain.js";
//@codekit-prepend "shBrushPython.js";
//@codekit-prepend "shBrushRuby.js";
//@codekit-prepend "shBrushSql.js";
//@codekit-prepend "shBrushVb.js";
//@codekit-prepend "shBrushXml.js";
//@codekit-prepend "jquery.zclip.js";
//@codekit-append "models.js";
//@codekit-append "views.js";
//@codekit-append "router.js";

$(function(){
    var router = new ConflictRouter();

    Backbone.history.start({ pushState: true });

    $('#language-select .dropdown-menu a').click(function(e){
        e.preventDefault();

        var new_lang = $(this).data('val')
            ,new_lang_text = $(this).text()
        ;

        $('#selected-language').text(new_lang_text).data('val', new_lang);
    });
});

var escapeHTML = function(line){
    return line.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
};

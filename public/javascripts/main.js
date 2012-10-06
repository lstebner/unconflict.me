//@codekit-prepend "jquery-1.8.2.js";
//@codekit-prepend "bootstrap/bootstrap-dropdown.js";
//@codekit-prepend "underscore-1.3.3.js";
//@codekit-prepend "backbone-0.9.2.js";
//@codekit-prepend "shCore.js";
//@codekit-prepend "shBrushXml.js";
//@codekit-prepend "jquery.zclip.js";
//@codekit-append "models.js";
//@codekit-append "views.js";
//@codekit-append "router.js";

$(function(){
    var router = new ConflictRouter();

    Backbone.history.start({ pushState: true });
});

var escapeHTML = function(line){
    return line.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
};

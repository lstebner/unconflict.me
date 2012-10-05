
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
;

_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3017);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/process', function(req, res){
  var raw = req.body.raw
      ,left_branch = ''
      ,right_branch = ''
      ,differences = []
      ,capturing_left = false
      ,capturing_right = false
      ,left_buffer = ''
      ,right_buffer = ''
      ,capturing = false
      ,line_num = 0
      ,merge_template = ''
      ,conflict_line = 0
  ;

  var getBranchName = function(line){
    var sp = line.split(' ');

    return _.trim(sp[1]);
  };

  var escapeHTML = function(line){
    return line.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
  };

  _.each(raw.split("\n"), function(line){
    line = line + "\n";
    line_num++;

    if (capturing_left || capturing_right){
      if (line.indexOf('===') > -1){
        capturing_left = false;
        capturing_right = true;
      }
      else if (line.indexOf('>>>>') > -1){
        if (_.isEmpty(right_branch)){
          right_branch = getBranchName(line);
        }

        capturing_right = false;

        var new_diff = {
          left: {
            branch: left_branch
            ,content: escapeHTML(left_buffer)
            ,line_num: conflict_line
          }
          ,right:{
            branch: right_branch
            ,content: escapeHTML(right_buffer)
            ,line_num: conflict_line
          }
        };

        differences.push(new_diff);

        left_buffer = '';
        right_buffer = '';
      }
      else if (capturing_left){
        left_buffer += line;
      }
      else if (capturing_right){
        right_buffer += line;
      }
    }
    else{
      if (line.indexOf('<<<<') > -1){
        capturing = true;
        capturing_left = true;

        if (_.isEmpty(left_branch)){
          left_branch = getBranchName(line);
        }

        merge_template += "{diff-" + differences.length + "}";

        conflict_line = line_num;
      }
      else{
        merge_template += line;
      }
    }
  });

  var response = {
    raw: raw
    ,differences: differences
    ,merge_template: merge_template
    ,total_lines: line_num
  };

  res.json(response);
});

app.get('/:any?/:any2?', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

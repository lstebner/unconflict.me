var CreateConflictView = Backbone.View.extend({
    template: null
    ,el: '#create-conflict'
    ,router: null
    ,initialize: function(opts){
        if (!opts){ opts = {}; }

        this.router = opts.router || null;

        this.conflict = new ConflictModel(opts.conflict || {});

        this.template = _.template($('#create-conflict-template').html());
    }
    ,renderDiffsView: function(contents){
        this.createConflict(
            { raw:contents }
            ,function(c){
                c.createMergeTemplate();

                $('textarea').hide();

                $('#diffs-overview').html(
                    _.template(
                        $('#diffs-overview-template').html()
                        ,{
                            conflict:c
                            ,active_diff: -1
                            ,mergeTemplate:c.get('merge_template_model')
                        }
                    )
                );
                $('#diffs-overview').show();
            }
        );

        $('#submit-box').fadeIn(1355);

        $('#conflicted-file').tooltip('hide');
    }
    ,readFile: function(){
        var file = document.getElementById('conflicted-file').files[0]
            ,reader = new FileReader()
            ,$textarea = this.$el.find('textarea')
            ,self = this
        ;

        setLanguageFromFilename(file.name);

        reader.readAsText(file, "UTF-8");

        reader.onprogress = function(e){};

        reader.onload = function(e){
            var result = e.target.result
            ;

            self.renderDiffsView(result);

            $textarea.val(result);
        };

        reader.onerror = function(e){
            console.log('file reader error');
        };
    }
    ,events: {
        'click .submit': function(e){
            var router = this.router;

            e.preventDefault();

            //this.conflict.createMergeTemplate();
            //console.log(this.conflict.get('differences').length);

            this.createConflict({}, function(c){
                router.createConflictSubmit(c);
                $('#language-select').hide();
            });
        }
        ,'keyup textarea': function(e){
            var val = $(e.currentTarget).val();

            if (val.length){
                attemptLanguageDetection();

                this.renderDiffsView(val);
            }
            else if (this.$el.find('#submit-box').is(':visible')){
                this.$el.find('#submit-box').fadeOut(455);
            }
        }
        ,'change #conflicted-file': function(e){
            this.readFile();
        }
        ,'click #diffs-overview': function(){
            $('#diffs-overview').hide();
            this.$el.find('textarea').show();
        }
    }
    ,createConflict: function(opts, fn){
        if (!opts){ opts = {}; }

        var raw = opts.raw || this.$el.find('textarea').val()
        ;

        this.conflict.set('raw', raw);
        this.conflict.set('language', $('#selected-language').data('val'));
        this.conflict.save({ differences:[] }, { success:function(c){
            if (fn){
                fn(c);
            }
        }});
    }
    ,render: function(){
        this.$el.empty();

        this.$el.html(this.template({
            conflict: this.conflict
        }));

        this.$el.find('#submit-box').hide();

        this.$el.find('#conflicted-file').tooltip({
            placement: 'right'
            ,title: 'Select your conflicted file here'
            ,trigger: 'manual'
        }).tooltip('show');

        $('#language-select').show();
    }
});

var ResolveDiffsView = Backbone.View.extend({
    template: null
    ,el: '#resolve-diffs'
    ,conflict: null
    ,active_diff: 0
    ,active_diff_index: 0
    ,num_diffs: 0
    ,router: null
    ,initialize: function(opts){
        if (!opts){ opts = {}; }

        this.router = opts.router || null;

        this.conflict = opts.conflict;

        this.num_diffs = this.conflict.get('differences').length;
        this.setActiveDiff(0);

        this.template = _.template($('#diff-template').html());
    }
    ,events: {
        'click .next': function(e){
            e.preventDefault();

            this.nextDiff();
        }
        ,'click .previous': function(e){
            e.preventDefault();

            this.previousDiff();
        }
        ,'click .resolve': function(e){
            e.preventDefault();

            this.router.navigate('/resolve', { trigger:true });
        }
        ,'click .use-left': function(e){
            e.preventDefault();

            this.active_diff.useLeft();

            this.nextDiff();
        }
        ,'click .use-right': function(e){
            e.preventDefault();

            this.active_diff.useRight();

            this.nextDiff();
        }
        ,'click .syntaxhighlighter, .select-diff-bubble': function(e){
            var side = $(e.currentTarget).closest('.source').attr('id');

            if (side == 'left'){
                this.active_diff.useLeft();
            }
            else{
                this.active_diff.useRight();
            }

            this.nextDiff();
        }
    }
    ,nextDiff: function(){
        this.router.touchConflict(this.conflict);
        this.active_diff_index = parseInt(this.active_diff_index) + 1;

        if (this.active_diff_index >= this.num_diffs){
            this.router.navigate('/resolve', { trigger:true });
        }
        else{
            this.router.navigate('/diffs/' + this.active_diff_index, { trigger: true });
        }
    }
    ,previousDiff: function(){
        this.active_diff_index = parseInt(this.active_diff_index) - 1;
        this.router.navigate('/diffs/' + this.active_diff_index, { trigger: true });
    }
    ,setActiveDiff: function(index){
        this.active_diff = this.conflict.get('differences').at(index);
        this.active_diff_index = index;
    }
    ,render: function(){
        this.$el.empty();

        this.$el.html(this.template({
            conflict: this.conflict
            ,active_diff: this.active_diff
            ,num_diffs: this.num_diffs
            ,active_diff_index: this.active_diff_index
        }));

        SyntaxHighlighter.highlight();

        this.$el.find('.select-diff-bubble').css({ opacity:0 });
        this.$el.find('.syntaxhighlighter').css({ opacity: .4 });

        this.$el.find('#left, #right').hover(function(){
            $(this).find('.select-diff-bubble').animate({ opacity:.9 });
            $(this).find('.syntaxhighlighter').animate({ opacity:1 });
        }, function(){
            $(this).find('.select-diff-bubble').animate({ opacity:0 })
            $(this).find('.syntaxhighlighter').animate({ opacity:.4 });
        });

        $('#minimap').html(
            _.template(
                $('#diffs-overview-template').html()
                ,{
                    active_diff: this.active_diff_index
                    ,conflict:this.conflict
                    ,mergeTemplate:this.conflict.get('merge_template_model')
                }
            )
        );

        this.$el.find('.select-diff-bubble').hover(
            //over
            function(){
                var $self = $(this);

                this.hoverTimeout = setTimeout(function(){
                    $self.animate({ opacity:.2 }, 1800);
                }, 350);
            },
            //out
            function(){
                if (_.has(this.hoverTimeout) && this.hoverTimeout){
                    clearTimeout(this.hoverTimeout);
                }

                $(this).stop();
                $(this).animate({ opacity:.9 }, 1800);
            }
        );
    }
});

var ResolvedView = Backbone.View.extend({
    el: '#resolved-view'
    ,template: null
    ,conflict: null
    ,router: null
    ,initialize: function(opts){
        if (!opts){ opts = {}; }

        this.router = opts.router || null;

        this.conflict = opts.conflict;
        this.conflict.createMergeTemplate();

        this.template = _.template($('#resolved-merge-template').html());
    }
    ,events: {

    }
    ,render: function(){
        this.$el.empty();

        this.$el.html(this.template({
            merged_output: this.conflict.get('merge_template_model').get('rendered')
        }));

        this.$el.find('#click-to-copy').zclip({
            copy: function(){
                return $('#template-for-copy').val()
            }
            ,afterCopy: function(){
                $('#click-to-copy').text('Copied!');

                setTimeout(function(){
                    $('#click-to-copy').fadeOut(2000, function(){
                        $(this).text('Click to Copy').fadeIn(1000);
                    });
                }, 2000);
            }
        });

        SyntaxHighlighter.highlight();
    }
});

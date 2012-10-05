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
    ,events: {
        'click .submit': function(e){
            e.preventDefault();

            this.createConflict();
        }
        ,'keyup textarea': function(e){
            //this.$el.find('pre').html( escapeHTML($(e.currentTarget).val()) );
            //SyntaxHighlighter.highlight();

            var val = $(e.currentTarget).val();

            if (val.length){
                this.$el.find('#submit-box').fadeIn(1355);

                //this.$el.find('#formatted-code').html(escapeHTML($(e.currentTarget).val()));
                //this.$el.find('#formatted-code').fadeIn(600);
                //this.$el.find('textarea').fadeOut(600);

                //setTimeout(function(){
                    //SyntaxHighlighter.highlight();
                //}, 300);
            }
        }
    }
    ,createConflict: function(opts){
        if (!opts){ opts = {}; }

        var raw = this.$el.find('textarea').val()
            ,router = this.router
        ;

        this.conflict.set('raw', raw);
        this.conflict.save({}, { success:function(c){
            router.createConflictSubmit(c);
        }});
    }
    ,render: function(){
        this.$el.empty();

        this.$el.html(this.template({
            conflict: this.conflict
        }));

        this.$el.find('#submit-box').hide();
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

        this.template = _.template($('#diff-template').html())
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
        this.router.touchConflict(this.conflict);
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
    ,render: function(){
        this.$el.empty();

        this.$el.html(this.template({
            merged_output: this.conflict.get('merge_template_model').get('rendered')
        }));

        SyntaxHighlighter.highlight();
    }
});
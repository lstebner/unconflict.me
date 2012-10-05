var SourceModel = Backbone.Model.extend({
    defaults: {
        branch: ''
        ,content: ''
        ,starting_line_num: 0
    }
});

var DiffModel = Backbone.Model.extend({
    defaults: {
        left: null
        ,right: null
        ,selected: false
        ,custom: null
    }
    ,initialize: function(opts){
        if (!opts){ opts = {}; }

        var source_data = {
            starting_line_num: opts.line_num || 0
        };

        this.set('left', new SourceModel(_.extend(source_data, opts.left || {})));
        this.set('right', new SourceModel(_.extend(source_data, opts.right || {})));
    }
    ,useRight: function(){
        this.set('selected', this.get('right'));
    }
    ,useLeft: function(){
        this.set('selected', this.get('left'));
    }
    ,useCustom: function(data){
        this.set('custom', new SourceModel(data));
        this.set('selected', this.get('custom'));
    }
});

var DiffsCollection = Backbone.Collection.extend({
    model: DiffModel
});

var MergeTemplateModel = Backbone.Model.extend({
    defaults: {
        template: []
        ,rendered: ''
        ,differences: []
        ,merge_diff_indexes: []
    }
    ,setDifferences: function(diffs){
        this.set('differences', diffs);
    }
    ,run: function(opts){
        if (!opts){ opts = {}; }

        var pieces = this.get('template')
            ,rendered = ''
        ;

        //key = the index of the difference
        //index = the line number in the template to insert at
        _.each(this.get('merge_diff_indexes'), function(index, key){
            var diff = this.get('differences').at(key);

            if (diff){
                pieces[index] = diff.get('content');
            }
        });

        // this.get('differences').each(function(diff, index){
        //     if (diff.get('selected')){
        //         t = t.replace('{diff-' + index + '}', diff.get('selected').get('content'));
        //     }
        // });

        rendered = pieces.join("\n");

        this.set('rendered', escapeHTML(rendered));

        return t;
    }
});

var ConflictModel = Backbone.Model.extend({
    defaults: {
        raw: ''
        ,differences: []
        ,merge_template: []
        ,merge_diff_indexes: []
        ,merge_template_model: null
    }
    ,url: '/process'
    ,initialize: function(opts){
        if (!opts){ opts = {}; }

        this.on('change:differences', this.refreshDiffs, this);
        this.on('change:merge_template', this.refreshMergeTemplate, this);
    }
    ,refreshDiffs: function(){
        this.set('differences', new DiffsCollection(this.get('differences')), { silent:true });
    }
    ,refreshMergeTemplate: function(){
        this.set(
            'merge_template_model',
            new MergeTemplateModel({
                template:this.get('merge_template')
                ,merge_diff_indexes:this.get('merge_diff_indexes')
            }),
            { silent:true }
        );
    }
    ,createMergeTemplate: function(){
        var mt = new MergeTemplateModel({
            template: this.get('merge_template')
            ,merge_diff_indexes: this.get('merge_diff_indexes')
        });

        mt.setDifferences(this.get('differences'));

        mt.run();

        this.set('merge_template_model', mt);
    }
});

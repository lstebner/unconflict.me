var conflict = null;

var ConflictRouter = Backbone.Router.extend({
    currentView: null
    ,routes: {
        'diffs/:index': 'diffs'
        ,'resolve': 'resolve'
        ,'*any': 'index'
    }
    ,touchConflict: function(conflict){
        //this.conflict = conflict;
    }
    ,changeView: function(newView){
        if (this.currentView){
            this.currentView.undelegateEvents();
        }

        this.currentView = newView;

        this.currentView.render();
    }
    ,index: function(){
        var conflict_form = new CreateConflictView({
            el:'#content'
            ,conflict: conflict
            ,router: this
        });

        this.changeView(conflict_form);
    }
    ,diffs: function(index){
        if (!conflict){
            this.navigate('/', { trigger:true });
            return;
        }

        var diffs_view = new ResolveDiffsView({
            el:'#content'
            ,conflict: conflict
            ,router: this
        });

        diffs_view.setActiveDiff(index);

        this.changeView(diffs_view);
    }
    ,resolve: function(){
        if (!conflict){
            this.navigate('/', { trigger:true });
            return;
        }

        var resolved_view = new ResolvedView({
            el: '#content'
            ,conflict: conflict
            ,router: this
        });

        this.changeView(resolved_view);
    }
    ,createConflictSubmit: function(c){
        conflict = c;

        this.navigate('diffs/0', { trigger:true });
    }
});

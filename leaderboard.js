Players = new Meteor.Collection('players');

if(Meteor.isClient) {
  Template.leaderboard.items = function() {
    var filter = Session.get('filter');
    if(!filter || filter === "all") {
      return Players.find({}, {sort: {score: -1, name: 1}});
    } else if(filter === "still-playing") {
      return Players.find({score: {$lt: 100}}, {sort: {score: -1, name: 1}});
    } else if(filter === "winners") {
      return Players.find({score: {$gt: 99}}, {sort: {score: -1, name: 1}});
    }
  }

  Template.leaderboard.events({
    'click .player' : function(){
      Session.set('selectedPlayer', this._id);
    },
    'click #add' : function() {
      var $input = $('#newPlayer');
      Players.insert({name: $input.val(), score: 0});
      $input.val('');
    }
  });

  Template.leaderboard.selectedClass = function() {
    if(Session.get('selectedPlayer') === this._id) {
      return "selected"; 
    }
  };

  Template.filter.events({
    'click a' : function(e) {
      e.preventDefault();
      var href = $(e.target).data('id');
      Session.set('filter', href);
    }
  });

  Template.filter.filters = function() {
    var filters = [
      {label: "All", id: "all"},
      {label: "Still Playing", id: "still-playing"},
      {label: "Winners", id: "winners"}
    ];
    return filters;
  }

  Template.filter.selected = function() {
    return Session.equals('filter', this.id) ? "selected" : "";
  }

  Template.details.events({
    'click #delete' : function() {
      Players.remove({_id: Session.get('selectedPlayer')});
    },
    'click #inc' : function() {
      Players.update( 
        Session.get('selectedPlayer'), 
        { $inc: {score: 5}}
      );
    }
  });

  Template.details.selected = function() {
    return Players.findOne( Session.get('selectedPlayer'));
  };
}

if(Meteor.isServer) {
  Meteor.startup( function() {
    if (Players.find().count() === 0) {
      var playerNames = ["Jon", "Jeff", "Maggie", "Dianna", "Dom", "Virginia"];

      playerNames.map(function(name){
        Players.insert({ 
          name: name, 
          score: Math.floor(Random.fraction()*10)*5
        });
      });
    }
  });
}
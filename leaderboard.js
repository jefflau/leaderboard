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
  };

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

  Template.leaderboard.activeClass = function() {
    if(Session.get('selectedPlayer') === this._id) {
      return "active";
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
  };

  Template.filter.selected = function() {
    return Session.equals('filter', this.id) ? "selected" : "";
  };

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

  Template.d3vis.created = function () {
    // Defer to make sure we manipulate DOM
    _.defer(function () {
      Deps.autorun(function () {

          data = Players.find({}, {sort: {score: -1, name: 1}}).fetch();
          scores = data.map(function(d) { return d.score});

          var width = 420,
              barHeight = 20;

          var x = d3.scale.linear()
              .domain([0, d3.max(scores)])
              .range([0, width]);

          var chart = d3.select(".chart")
              .attr("width", width)
              .attr("height", barHeight * scores.length);

          $(".chart").empty();

          var bar = chart.selectAll("g")
              .data(scores)
            .enter().append("g")
              .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

          bar.append("rect")
              .attr("width", x)
              .attr("height", barHeight - 1);

          bar.append("text")
              .attr("x", function(d) { return x(d) - 3; })
              .attr("y", barHeight / 2)
              .attr("dy", ".35em")
              .text(function(d) { return d; });

          console.log('end');
      });
    });
  }
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

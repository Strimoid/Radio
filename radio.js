var radio = angular.module('Radio', ['ui.router', 'youtube-embed']);

radio.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('homepage', { url: '/', 'template': '' })
        .state('group', { url: '/:groupId', template: '', onEnter: function($rootScope, $stateParams) {
            $rootScope.$broadcast('changeGroup', $stateParams.groupId);
         }})
});

radio.controller('Radio', function ($scope, $http, $youtube) {
    $scope.changeGroup = function(group) {
        $scope.page = 1;

        $http.get('http://api.strimoid.pl/contents?per_page=50&domain=youtube.com&group='+ group).success(function(data) {
            $scope.contents = [];
            var contents = data.data;
            var ids = [];

            contents.forEach(function(content) {
                var id = $youtube.getIdFromURL(content.url);

                if (id) {
                    $scope.contents[id] = content;
                    ids.push(id);
                }
            });

            $scope.playVideos(ids);
        });

        $scope.currentGroup = group;
    };

    $scope.playVideos = function(ids) {
        $youtube.loadPlayer();

        $scope.$on('youtube.player.ready', function () {
            $youtube.player.loadPlaylist(ids);
            $youtube.player.playVideo();
        });
    };

    $scope.$on('changeGroup', function(event, id) {
        $scope.changeGroup(id);
    });

    $scope.loadGroups = function() {
        var url = 'http://api.strimoid.pl/groups?sort=subscribers';

        if ($scope.search)
            url += '&name=' + $scope.search;

        $http.get(url).success(function(data) {
            $scope.groups = data.data.slice(0, 50);
        });
    };

    $scope.$on('youtube.player.playing', function () {
        var index = $youtube.player.getPlaylistIndex();
        var currentId = $youtube.player.getPlaylist()[index];

        $scope.currentContent = $scope.contents[currentId];
    });

    $scope.loadGroups();
});


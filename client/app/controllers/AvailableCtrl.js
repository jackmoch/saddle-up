'use strict';

app.controller('AvailableCtrl', function($scope, $http, $location, UserFactory) {
  
  /////////////////////////////////////////

  /////////////////////////////////////////
  //Load users to page
  const loadPage = () => {
    $http
      .get('/currentUser')
      .then((data) => {
        UserFactory.setCurrentUsername(data.data.username)
      })
      .then(() => {
        $scope.currentUser = UserFactory.getCurrentUsername();
      })
      .then(() => {
        UserFactory
          .getCurrentUser($scope.currentUser)
          .then(({data}) => {
            $scope.currentUser = data
          })
      })
      .then(() => {
        UserFactory.loadUserList()
          .then(({data}) => {
            $scope.currentUser.dislikedusers.forEach((dislikedUser) => {
              data.forEach((user, index) => {
                if(user.username === dislikedUser) {
                  data.splice(index, 1)
                }
              })
            })
            $scope.currentUser.likedusers.forEach((likedUser) => {
              data.forEach((user, index) => {
                if(user.username === likedUser) {
                  data.splice(index, 1)
                }
              })
            })
            $scope.allUsers = data
          });
      })
  }
  loadPage();
  /////////////////////////////////////////


  /////////////////////////////////////////
  $scope.likeUser = (user) => {
    const likedUser = user.username;
    $http
    .put(`api/like/${$scope.currentUser.username}/${likedUser}`)
    .then((data) => {
      loadPage()
      //Run the page load display function
    })
    .catch(console.error)
  };

  $scope.dislikeUser = (user) => {
    const dislikedUser = user.username;
    $http
    .put(`api/dislike/${$scope.currentUser.username}/${dislikedUser}`)
    .then(() => {
      loadPage()
      //Run the page load display function
    })
    .catch(console.error)
  };
  /////////////////////////////////////////

});//End AvailableCtrl

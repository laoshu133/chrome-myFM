/**
 * main
 *
 */

(function() {
    var playList = new List();

    console.log(playList.channels);

    playList.loadChannels()
    .always(function() {
        console.log(arguments);
        console.log(playList.channels);
    });


})();

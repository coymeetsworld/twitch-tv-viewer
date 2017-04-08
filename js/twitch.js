$(document).ready(function() {

  const NO_USER_ICON_URL= "imgs/twitchDefaultIcon.png";

  /* List of users to query. */
  const USERNAMES = ["freecodecamp", "magic", "channelfireball", "liveatthebike", "karltowns32", "celinalin", "nanonoko","wsopreplaystream","jonathanlittle", "esl_sc2", "ogamingsc2", "habathcx", "terakilobyte", "thomasballinger", "comster404", "brunofin", "somejunkuserthatdoesntexist"];

  const CLIENT_ID = "skji05ppnsavrfz5ydkkttvbbzj2h29";


  /* Creates click function for filtering out streams. */
  const createFilterActions = () => {
    $("#filterNone").click(function() {
      console.log("Click no filter");
      $(".channelFeatured").removeClass("hidden");
      $(".channelOnline").removeClass("hidden");
      $(".channelOffline").removeClass("hidden");
      $(".channelClosed").removeClass("hidden");
    });
    $("#filterOffline").click(function() {
      console.log("Click offline filter");
      $(".channelOnline").addClass("hidden");
      $(".channelFeatured").addClass("hidden");
      $(".channelOffline").removeClass("hidden");
      $(".channelClosed").removeClass("hidden");
    });
    $("#filterOnline").click(function() {
      console.log("Click online filter");
      $(".channelOffline").addClass("hidden");
      $(".channelClosed").addClass("hidden");
      $(".channelOnline").removeClass("hidden");
      $(".channelFeatured").removeClass("hidden");
    });
  }


  /* Creates the image tag for the user. If they do not have an image a default will be used in place.*/
  const createUserImage = (src) => {
    let imageTag = $('<img>');
    imageTag.addClass('userIcon');

    if (src != null) {
      imageTag.attr('src', src);
    } else {
      imageTag.attr('src', NO_USER_ICON_URL);
    }
    return imageTag;
  }


  /* Creates the image tag for showing the preview of the stream. Only used when a stream is live, there are no previews on offline streams. */
  const createPreviewImage = (streamerName, src) => {
    let link = $('<a>');
    link.attr('href', 'http://www.twitch.tv/' + streamerName);
    link.attr('target', '_blank');
    let imageTag = $('<img>');
    imageTag.attr('src', src);
    link.html(imageTag);
    return link;
  }


  /* Creates the link for the streamer to go to their Twitch page. Will also display if its a featured stream or not.*/
  const createLink = (streamerName, isFeatured) => {
    let link = $('<a>');
    link.attr('href', 'http://www.twitch.tv/' + streamerName);
    link.attr('target', '_blank');
    if (isFeatured) {
      link.html("<strong>Featured:</strong> " + streamerName);
    } else {
      link.html(streamerName);
    }
    return link;
  }


  /* Pulls information about a featured streamer. */
  const getFeaturedInfo = (name) => {
    $.getJSON('https://api.twitch.tv/kraken/users/' + name + '?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29', function (userData) {
      if (userData.bio != null && userData.bio != '') {
        console.log("Username: " + userData.name);
        console.log("Bio: '" + userData.bio + "'");
        let infoTag = $('<img>');
        infoTag.attr('src', 'imgs/info.png');
        infoTag.attr('data-toggle', 'tooltip');
        infoTag.attr('title',userData.bio);
        infoTag.appendTo($('#featuredStream'+name));
        $('[data-toggle="tooltip"]').tooltip();
      }
    });
  }

  /* Makes an API call to get the top 5 featured streams on Twitch and render them on the page.
    TODO: can't limit the rate with the client_id, investigate
    https://api.twitch.tv/kraken/streams/featured?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29?limit=5&offset=0
  */
  const getFeaturedStreams = () => {
    $.getJSON('https://api.twitch.tv/kraken/streams/featured?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29', function (featuredData) {
      let stream;
      for (let i = 0; i < 5; i++) {
        stream = featuredData.featured[i].stream;

        let channelItem = $('<li>');
        channelItem.attr('class', 'flex-item');
        let iconColumn = $('<div>');
        iconColumn.attr('class', 'streamerIcon');
        $(createUserImage(stream.channel.logo)).appendTo(iconColumn);
        $(iconColumn).appendTo(channelItem);

        let nameColumn = $('<div>');
        nameColumn.attr('class', 'streamerName');
        $(createLink(stream.channel.display_name, true)).appendTo(nameColumn);
        nameColumn.attr('id', 'featuredStream' + stream.channel.display_name);
        $(nameColumn).appendTo(channelItem);

        let statusColumn = $('<div>');
        statusColumn.attr('class', 'streamStatus');
        channelItem.addClass('channelFeatured');
        statusColumn.text(stream.channel.game + ": " + stream.channel.status);
        $(statusColumn).appendTo(channelItem);
        let streamPreview = $('<div>');
        $(createPreviewImage(stream.channel.display_name, stream.preview.large)).appendTo(streamPreview);
        streamPreview.addClass('streamPreview');
        $(streamPreview).appendTo(channelItem);
        let streamPreviewInfo = $('<div>');
        streamPreviewInfo.addClass('streamPreviewInfo');
        streamPreviewInfo.html("Viewers: " + stream.viewers);
        $(streamPreviewInfo).appendTo(channelItem);

        $(channelItem).appendTo("#channels");
        getFeaturedInfo(stream.channel.display_name);
      }
    });
  }

  /* Makes an API call to get information on a specific Twitch user and renders it on the page. */
  const getUsers = (user) => {
    //$.getJSON('https://api.twitch.tv/kraken/users/' + user + '?client_id=skji05ppnsavrfz5ydkkttvbbzj2h29', function (userData) {
    $.getJSON(`https://api.twitch.tv/kraken/users/${user}?client_id=${CLIENT_ID}`, (userData) => {

      if (userData.status == 404) {
        console.log("404 " + userData.error + ": " + userData.message);
        return;
      }

      let channelItem = $('<li>');
      channelItem.attr('class', 'flex-item');

      let iconColumn = $('<div>');
      iconColumn.attr('class', 'streamerIcon');
      $(createUserImage(userData.logo)).appendTo(iconColumn);
      $(iconColumn).appendTo(channelItem);

      let nameColumn = $('<div>');
      nameColumn.attr('class', 'streamerName');
      $(createLink(userData.display_name, false)).appendTo(nameColumn);

      if (userData.bio && userData.bio !== '') {
        let infoTag = $('<img>');
        infoTag.attr('src', 'imgs/info.png');
        infoTag.attr('data-toggle', 'tooltip');
        infoTag.attr('title',userData.bio);
        infoTag.appendTo(nameColumn);

      }
      $(nameColumn).appendTo(channelItem);

      $.getJSON(`https://api.twitch.tv/kraken/streams/${userData.name}?client_id=${CLIENT_ID}`, (streamData) => {
        let statusColumn = $('<div>');
        statusColumn.attr('class', 'streamStatus');

        if (streamData.status === 422) {
          channelItem.addClass('channelClosed');
          statusColumn.text('Account closed');
          $(statusColumn).appendTo(channelItem);
        }
        else if (streamData.stream === null) {
          channelItem.addClass('channelOffline');
          statusColumn.text('Offline');
          $(statusColumn).appendTo(channelItem);
        } else {
          channelItem.addClass('channelOnline');
          statusColumn.text(streamData.stream.channel.game + ": " + streamData.stream.channel.status);
          $(statusColumn).appendTo(channelItem);
          let streamPreview = $('<div>');
          $(createPreviewImage(userData.name, streamData.stream.preview.large)).appendTo(streamPreview);
          streamPreview.addClass('streamPreview');
          $(streamPreview).appendTo(channelItem);
          let streamPreviewInfo = $('<div>');
          streamPreviewInfo.addClass('streamPreviewInfo');
          streamPreviewInfo.html("Viewers: " + streamData.stream.viewers);
          $(streamPreviewInfo).appendTo(channelItem);
        }

        $(channelItem).appendTo("#channels");
        $('[data-toggle="tooltip"]').tooltip(); // enable tooltips by hovering over info icon.
      });
    });
  }

  createFilterActions();
  getFeaturedStreams();
  for (let i = 0; i < USERNAMES.length; i++) {
    getUsers(USERNAMES[i]);
  }

});
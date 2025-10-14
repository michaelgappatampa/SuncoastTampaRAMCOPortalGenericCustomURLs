(function () {
  // Only run if not on the specified hostname
  if (window.location.hostname !== 'greatertampaisv.ramcoams.org') {
    document.addEventListener('DOMContentLoaded', function () {
      // Create the div element
      var widgetDiv = document.createElement('div');
      widgetDiv.id = 'bf-revz-widget-3146340650';

      // Create the script element for Birdeye
      var script = document.createElement('script');
      script.defer = true;
      script.type = 'text/javascript';
      script.src = 'https://birdeye.com/embed/v6/126335/1/3146340650/e011d59fe64f8badee44eb0fc418975a6d3a68f83e09826a?emailRequired=1';

      // Append elements to <footer> if it exists, otherwise <body>
      var target = document.querySelector('footer') || document.body;
      target.appendChild(script);
      target.appendChild(widgetDiv);
    });
  }
})();

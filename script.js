(function () {
  // Only run if not on the specified hostname
  if (window.location.hostname !== 'greatertampaisv.ramcoams.org') {
    document.addEventListener('DOMContentLoaded', function () {
      // Create the div element
      var widgetDiv = document.createElement('div');
      widgetDiv.id = 'snapengage-chat-widget';

      // Create the SnapEngage script element
      var se = document.createElement('script');
      se.type = 'text/javascript';
      se.async = true;
      se.src = 'https://storage.googleapis.com/code.snapengage.com/js/1d363fa7-55f0-42fd-8d24-c20df812db52.js';

      var done = false;
      se.onload = se.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          done = true;
          // Optional: Run SnapEngage API calls after it loads
          // Example: SnapEngage.allowChatSound(true);
        }
      };

      // Append elements to <footer> if it exists, otherwise <body>
      var target = document.querySelector('footer') || document.body;
      target.appendChild(widgetDiv);
      target.appendChild(se);
    });
  }
})();

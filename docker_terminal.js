window.docker = (function(docker) {
  docker.terminal = {
    startTerminalForContainer: function(host, container) {
      var term = new Terminal();
      term.open();
      
      var websocket = new WebSocket('ws://localhost:8080');
      websocket.onopen = function(evt) { onOpen(evt) };
      websocket.onclose = function(evt) { onClose(evt) };
      websocket.onmessage = function(evt) { onMessage(evt) };
      websocket.onerror = function(evt) { onError(evt) };

      term.on('data', function(data) {
        console.log(data)
        websocket.send(data);
      });

      function onOpen(evt) {
        term.writeln("Session started");
        term.write(">> ");
      }  

      function onClose(evt) {
        term.write("Session terminated");
      }  

      function onMessage(evt) { 
        term.write(evt.data);
      }  

      function onError(evt) { 
      }  
    }
  };

  return docker;
})(window.docker || {});

$(function() {
  $("[data-docker-terminal-container]").each(function(i, el) {
    var container = $(el).data('docker-terminal-container');
    var host = $(el).data('docker-terminal-host');
    docker.terminal.startTerminalForContainer(host, container);
  });
});

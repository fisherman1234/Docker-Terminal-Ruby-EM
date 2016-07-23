require 'docker-api'
require 'em-websocket'

stdout = EM::Channel.new
container = Docker::Container.all.last
s1, s2 = Socket.pair(:UNIX, :DGRAM, 0)

Thread.new do
  container.exec(['/bin/bash'], stdin: s2, tty: true) do |chunk|
    stdout.push(chunk)
  end
end

puts "Starting a server on port 8080, connecting to the first container available"

EM.run {
  EM::WebSocket.run(:host => "0.0.0.0", :port => 8080, :debug => false) do |ws|
    ws.onopen { |handshake|
      puts "WebSocket opened #{{
          :path => handshake.path,
          :query => handshake.query,
          :origin => handshake.origin,
      }}"
      stdout.subscribe { |msg| ws.send msg }
    }
    ws.onmessage { |msg|
      s1 << msg
    }
  end
}


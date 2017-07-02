require 'gosu'

class MusicExample < Gosu::Window
    def initialize
        super 640, 480
        self.caption = "Music Example"
        
        @font = Gosu::Font.new(32, name: "Nimbus Mono L")
        @music = Gosu::Song.new("./music.ogg")
    end
    
    def draw
        @font.draw("Music Playing: %s" % @music.playing?, 20, 20, 0)
        @font.draw("Press 'M' to toggle the music.", 20, 52, 0)
    end
    
    def button_up(keycode)
        if keycode == Gosu::KbM then
            if @music.playing? then
                @music.stop
            elsif 
                @music.play(true)
            end
        end
    end
end

MusicExample.new.show

require 'gosu'

class SfxExample < Gosu::Window
    def initialize
        super 640, 480
        self.caption = "Sound FX Example"
        
        @bounce = Gosu::Sample.new("bounce.wav")
        @font = Gosu::Font.new(32, name: "Nimbus Mono L")
    end
    
    def button_up(key_id)
	    if key_id == Gosu::KbA then
	        @bounce.play
	    end
	end
    
    def draw
        @font.draw("Press 'A' to play the sound!", 10, 10, 0)
    end
end

SfxExample.new.show

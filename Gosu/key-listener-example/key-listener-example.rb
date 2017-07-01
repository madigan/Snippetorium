require 'gosu'

class KeyListenerExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Keyboard Example"
		@font = Gosu::Font.new(32, name: "Nimbus Mono L")
	end

	def button_up(key_id)
		if key_id == Gosu::KbEscape then
			self.close
		end
	end

	def draw
		@font.draw("Pressing <Escape> will close this window.", 40, 40, 0)
	end
end 

KeyListenerExample.new.show

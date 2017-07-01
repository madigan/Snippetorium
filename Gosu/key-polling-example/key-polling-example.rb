require 'gosu'

class KeyPollingExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Key Polling Example"
		@font = Gosu::Font.new(32, name: "Nimbus Mono L")
	end

	def update
		if button_down?(Gosu::KbA) then
			@text = "You're totally pressing the <A> key!"
		else
			@text = "Don't you dare press that <A> key..."
		end
	end

	def draw
		@font.draw(@text, 40, 40, 0)
	end
end

window = KeyPollingExample.new.show

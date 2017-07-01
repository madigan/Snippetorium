require 'gosu'

class KeyboardExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Keyboard Example"
		@font = Gosu::Font.new(32, name: "Nimbus Mono L")
		self.text_input = Gosu::TextInput.new
		self.text_input.text = "Type something!"
	end

	def draw
		@font.draw(self.text_input.text, 20, 40, 0)
	end
end 

window = KeyboardExample.new.show

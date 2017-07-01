require 'gosu'

class ClosableWindow < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Closable Window"
		@font = Gosu::Font.new(32, name: "Nimbus Mono L")
	end

	def button_up(key_id)
		self.close
	end

	def draw
		@font.draw("Press any key to close...", 40, 40, 0)
	end
end

ClosableWindow.new.show

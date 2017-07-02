require 'gosu'

class MouseExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Mouse Example"
		@font = Gosu::Font.new(16, name: "Nimbus Mono L")
	end

	def draw
		msg = sprintf "The mouse is at (%.0f,%.0f).", self.mouse_x, self.mouse_y
		@font.draw(msg, self.mouse_x, self.mouse_y, 0)
	end

	def needs_cursor?
		true
	end
end 

MouseExample.new.show

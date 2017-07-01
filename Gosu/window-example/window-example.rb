require 'gosu'

class GameWindow < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "My First Game"
	end
end

window = GameWindow.new.show

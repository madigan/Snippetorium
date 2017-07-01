require 'gosu'

class ImageExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Image Example"
		@ball = Gosu::Image.new("./ball.png")
	end
	
	def draw
		@ball.draw( 100, 100, 0 )
	end
end

window = ImageExample.new.show

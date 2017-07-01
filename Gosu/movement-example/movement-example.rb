require 'gosu'
require './ball.rb'

class MovementExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Movement Example"
		img = Gosu::Image.new("./ball.png")
		@ball = Ball.new(img, self.width/2, self.height/2, 0)
	end

	def draw
		@ball.draw
	end

	def update
		timeElapsed = self.update_interval / 1000	#Elapsed time in seconds
		@ball.update(self, timeElapsed)
	end 
end

window = MovementExample.new.show

